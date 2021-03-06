import {MdParser} from '../MdParser';
import {MdBlockNode} from "../MdNode";
import {IParser} from "../IParser";

export class HeadingState implements IParser{
	constuctor(){ 

	}

	process(context: MdParser): MdBlockNode | false {
		if(context.src[context.cur] !== '#') return false;
		const line = context.line;
		const start = context.cur;

		let level = 1;
		while(line[level] === '#') level++;
		if (level > 6) return false;

		const content = line.slice(level).trim();
		context.goNextLine();

		return {
			type: 'block',
			name: `heading ${level}`,
			tag: `h${level}`,
			start,
			allowInlines: true,
			escapeEntities: false,
			length: context.cur - start,
			content,
		};
	}
}
