import {MdParser, isBlankLine, stripLineEnd} from '../markdown';
import {MdNode} from "../MdNode";
import {IParser} from "../IParser";

export class BlockquoteState implements IParser {
	process(context: MdParser): MdNode | false {
		let line = context.line;
		let indent = 0;
		const start = context.cur;

		if (!line || !line.startsWith('>')) {
			return false;
		}

        let contents = '';

        while (!context.end) {
            line = context.line;
            if (!line.startsWith('>')) {
                break;
            }
            contents += line.slice(1);
            context.goNextLine();
        }

        const items = new MdParser().parse(contents);

		return {
			type: 'containerBlock',
			name: 'blockquote',
			tag: 'blockquote',
			allowInlines: true,
			start,
			length: context.cur - start,
			children: items
		};
	}
}
