import {BlockquoteState} from './blocks/BlockquoteState';
import {CodeState} from './blocks/CodeState';
import {WHITESPACES} from './constants';
import {HeadingState} from './blocks/HeadingState';
import {HTMLState} from './blocks/HTMLState';
import {IParser} from './IParser';
import {ListState} from './blocks/ListState';
import {MdNode} from './MdNode';


function isWhiteSpace(ch) {
	return WHITESPACES.includes(ch);
}

function isLineEnd(ch) {
	return ch === '\n';
}

const LINEENDINGS = ['\r', '\n'];

export function stripLineEnd(line: string) {
	let end = line.length - 1;
	while (end > 0 && LINEENDINGS.includes(line[end])) end--;
	return line.slice(0, end + 1);
}

export function isBlankLine(line) {
	return line.trim().length === 0;
}

export class MdParser {
	public cur = 0;
	private parsers: IParser[] = [];
	public src: string = '';

	constructor() {
		this.parsers.push(new HeadingState());
		this.parsers.push(new CodeState());
		this.parsers.push(new HTMLState());
		this.parsers.push(new ListState());
		this.parsers.push(new BlockquoteState());
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

	parse(src: string): MdNode[] {
		this.src = src;
		this.cur = 0;

		const tokens = [];
		let tryCount = 0;

		let start = this.cur;

		let pLines = [];

		while (!this.end) {
			this.parsers.forEach(ps => {
				const token = ps.process(this);
				if (token) tokens.push(token);
			});
			if (this.cur === start) {
				if (!isBlankLine(this.line)) pLines.push(this.line);
				this.goNextLine();
			} else {
				const token: MdNode = {
					type: 'block',
					name: 'paragraph',
					tag: 'p',
					start: start,
					allowInlines: true,
					length: this.cur - start,
					content: pLines.join('\n')
				};
				tokens.push(token);
				pLines = [];
			}
			start = this.cur;
		}

		if (pLines.length > 0) {
			const token: MdNode = {
				type: 'block',
				name: 'paragraph',
				tag: 'p',
				start: start,
				allowInlines: true,
				length: this.cur - start,
				content: pLines.join('\n')
			};
			tokens.splice(-1, 0, token);
			pLines = [];
		}

		return tokens;
	}

	parseInline(line: string) {

	}

	render(nodes: MdNode[]): string[] {
		const res: string[] = [];

		nodes.forEach(node => {
			node.tag && res.push(`<${node.tag}>`);
			if (node.type === 'containerBlock') {
				res.push(...this.render(node.children));
			} else {
				res.push(node.content);
			}
			node.tag && res.push(`</${node.tag}>`);
		});

		return res;
	}
}


const testString = require('fs').readFileSync('./test.md', 'utf-8');

const parser = new MdParser();

const res = parser.parse(testString);
const html = parser.render(res).join('\n');
console.log(html);