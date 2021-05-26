import {MdParser, isBlankLine} from '../MdParser';
import {MdBlockNode} from "../MdNode";
import {IParser} from "../IParser";
import {ALLOWED_TAGS} from '../constants';

export class HTMLState implements IParser {
	process(context: MdParser): MdBlockNode | false {
		return this.process1(context) || this.process2(context) || false;
	}

	process1(context: MdParser): MdBlockNode | false {
		let line = context.line;
		const testPattern = /^<(script|pre|style)( |>|\n)/;
		if (!testPattern.test(line))
			return false;
		const start = context.cur;
		const endTag = '</' + line.match(testPattern)[1] + '>';
		let content = '';
		context.goNextLine();
		let addedLine = false;
		while (!context.end && line.indexOf(endTag) === -1) {
			content += line;
			line = context.line;
			addedLine = true;
			context.goNextLine();
		}
		content += line;
		content = content.trim();
		return {
			type: 'block',
			name: 'html',
			tag: '',
			allowInlines: false,
			start,
			length: context.cur - start,
			content
		};
	}

	process2(context: MdParser): MdBlockNode | false {
		let line = context.line;
		const testPattern = /^<\/?([a-z0-9]+)( |\t|\/>|>|\n)/;
		const start = context.cur;
		const tagName = testPattern.test(line) && line.match(testPattern)[1];
		if (!tagName || !ALLOWED_TAGS.includes(tagName.toLowerCase()))
			return false;
		let content = '';
		context.goNextLine();
		while (!context.end && !isBlankLine(line)) {
			content += line;
			line = context.line;
			context.goNextLine();
		}
		content += line;
		content = content.trim();
		return {
			type: 'block',
			name: 'html',
			tag: '',
			allowInlines: false,
			start,
			length: context.cur - start,
			content
		};
	}
}
