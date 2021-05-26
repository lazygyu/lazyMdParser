import {IParser} from './IParser';
import {MdBlockNode, MdInlineNode} from './MdNode';
import {InlineParser} from './InlineParser';


export function stripLineEnd(line: string) {
	return line.replace(/(\r\n)+$/, '');
}

export function isBlankLine(line) {
	return line.trim().length === 0;
}

function encodeEntities(str: string): string {
	return str.replace(/[\u00A0-\u9999<>\&]/g, function (i) {
		return '&#' + i.charCodeAt(0) + ';';
	})
}

type IParserConstructor = new () => IParser;

export class MdParser {
	public cur = 0;
	private parsers: IParser[] = [];
	public src: string = '';

	static parserConstructors: IParserConstructor[] = [];
	static registerParser(parser: IParserConstructor) {
		this.parserConstructors.push(parser);
	}

	constructor() {
		MdParser.parserConstructors.forEach(konstructor => {
			this.parsers.push(new konstructor());
		});
	}

	get ch(): string {
		return this.src[this.cur];
	}

	get line(): string {
		const start = this.cur;
		this.goNextLine();
		let end = this.cur;
		this.cur = start;
		return this.src.slice(start, end);
	}

	get end(): boolean {
		return this.cur >= this.src.length;
	}

	getNext(n): string {
		return this.src[this.cur + n];
	}

	checkString(str): boolean {
		return this.src.slice(this.cur, this.cur + str.length) === str;
	}

	goNext(n: number = 1): void {
		this.cur += n;
	}

	goNextLine(): void {
		while (!this.end && this.ch !== '\n') this.goNext();
		this.goNext();
	}

	parse(src: string): MdBlockNode[] {
		this.src = src.replace(/\r/g, '');
		this.cur = 0;

		const tokens = [];

		let start = this.cur;

		let pLines = [];

		while (!this.end) {
			this.parsers.forEach(ps => {
				const token = ps.process(this);
				if (token) tokens.push(token);
			});
			if (this.cur === start) {
				pLines.push(this.line.replace(/\n$/, ''));
				this.goNextLine();
			} else {
				if (pLines.length > 0) {
					pLines = pLines.join('\n').replace(/\n\n\n+/g, '\n\n').split('\n\n');
					const pTokens = pLines.map(str => {
						const token: MdBlockNode = {
							type: 'block',
							name: 'paragraph',
							tag: 'p',
							start: start,
							escapeEntities: false,
							allowInlines: true,
							length: this.cur - start,
							content: str,
						};
						return token;
					});
					tokens.splice(-1, 0, ...pTokens);
					pLines = [];
				}
			}
			start = this.cur;
		}

		if (pLines.length > 0) {
			pLines = pLines.join('\n').replace(/\n\n\n+/g, '\n\n').split('\n\n');
			tokens.push(...pLines.map(str => {
				const token: MdBlockNode = {
					type: 'block',
					name: 'paragraph',
					tag: 'p',
					start: start,
					escapeEntities: false,
					allowInlines: true,
					length: this.cur - start,
					content: str,
				};
				return token;
			}));
			pLines = [];
		}

		visit(tokens, item => {
			if (item.allowInlines) {
				const contentRoot = InlineParser.parse(item.content)
				item.contentRoot = contentRoot;
			}
		});

		return tokens;
	}

	private renderInline(node: MdInlineNode): string[] {
		const res: string[] = [];

		switch (node.type) {
			case 'youtube':
				res.push(`<iframe width="100%" height="315" src="https://www.youtube.com/embed/${node.src}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`)
				break;
			case 'link':
				res.push(`<a href='${node.href}'>${node.title && node.title.length > 0 ? encodeEntities(node.title) : node.href}</a>`);
				break;
			case 'text':
				res.push(encodeEntities(node.value).replace(/ \n/gm, '<br>\n'));
				break;
			case 'img':
				res.push(`<img src='${node.src}' title='${node.title}' >`);
				break;
			case 'code':
				res.push(`<code>${encodeEntities(node.value)}</code>`);
				break;
			case 'em':
				res.push('<em>');
				node.children.forEach(ch => {
					res.push(...this.renderInline(ch));
				});
				res.push('</em>');
				break;
			case 'strong':
				res.push('<strong>');
				node.children.forEach(ch => {
					res.push(...this.renderInline(ch));
				});
				res.push('</strong>');
				break;
			case 'root':
				node.children.forEach(ch => {
					res.push(...this.renderInline(ch));
				});
				break;
		}

		return res;
	}

	render(nodes: MdBlockNode[]): string[] {
		const res: string[] = [];

		nodes.forEach(node => {
			if ('tag' in node && node.tag) res.push(`<${node.tag}>`);
			if ('children' in node && node.children) {
				res.push(...this.render(node.children));
			}
			node.contentRoot && res.push(...this.renderInline(node.contentRoot));
			if (!node.contentRoot && node.content) {
				res.push(node.escapeEntities ? encodeEntities(node.content) : node.content);
			}
			if ('tag' in node && node.tag) res.push(`</${node.tag}>`);
		});

		return res;
	}

	static toHTML(str: string): string {
		const parser = new MdParser();
		return parser.render(parser.parse(str)).join('');
	}
}

function visit(arr, callback) {
	if (!Array.isArray(arr)) {
		console.log('visit not array', arr);
	}
	arr.forEach(item => {
		if ('children' in item && item.children) {
			visit(item.children, callback);
		}
		callback(item);
	});
}