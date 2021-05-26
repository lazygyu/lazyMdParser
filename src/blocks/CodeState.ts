import {MdParser} from '../MdParser';
import {MdBlockNode} from "../MdNode";
import {IParser} from "../IParser";

export class CodeState implements IParser {
	process(context: MdParser): MdBlockNode | false {
		let content = '', line = '';
		const start = context.cur;
		if (!context.line.startsWith('```'))
			return false;
		context.goNextLine();

		line = context.line;
		while (!context.end && !line.startsWith('```')) {
			content += line;
			context.goNextLine();
			line = context.line;
		}
		context.goNextLine();

		return {
			type: 'block',
			name: 'codeblock',
			tag: 'pre',
			allowInlines: false,
			start,
			length: context.cur - start,
			content
		};
	}
}
