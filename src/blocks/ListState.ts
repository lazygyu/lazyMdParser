import {MdParser, isBlankLine, stripLineEnd} from '../MdParser';
import {MdBlockNode} from "../MdNode";
import {IParser} from "../IParser";

export class ListState implements IParser {
	process(context: MdParser): MdBlockNode | false {
		return this.processUl(context) || this.processOl(context) || false;
	}

	makeLiItem(start, length) {
		return {
			type: 'containerBlock',
			name: 'listItem',
			tag: 'li',
			start,
			length,
			children: []
		};
	}

	processUl(context: MdParser): MdBlockNode | false {
		let line = stripLineEnd(context.line);
		let indent = 0;
		const start = context.cur;

		const items = [];
		let itemLines = [];

		if (!line || !line.startsWith('- ')) {
			return false;
		}

		indent = 2;
		itemLines.push(line.slice(indent));
		let currentItem = this.makeLiItem(context.cur, 0);
		context.goNextLine();

		while (true) {
			line = stripLineEnd(context.line);
			if (isBlankLine(line) && !context.end) {
				itemLines.push(line.slice(indent));
				context.goNextLine();
				continue;
			}
			if (line.startsWith('  ')) {
				itemLines.push(line.slice(indent));
				context.goNextLine();
				continue;
			}
			if (line.startsWith('- ')) {
				currentItem.length = (context.cur) - currentItem.start;
				currentItem.children = new MdParser().parse(itemLines.join('\n'));
				itemLines = [];
				items.push(currentItem);
				currentItem = this.makeLiItem(context.cur, 0);
				itemLines.push(line.slice(indent));
				context.goNextLine();
				continue;
			}

			currentItem.length = (context.cur) - currentItem.start;
			currentItem.children = new MdParser().parse(itemLines.join('\n'));
			items.push(currentItem);
			itemLines = [];
			break;
		}

		return {
			type: 'containerBlock',
			name: 'unorderedList',
			tag: 'ul',
			start,
			allowInlines: false,
			escapeEntities: false,
			length: context.cur - start,
			children: items
		};
	}

	processOl(context): MdBlockNode | false {
		let line = stripLineEnd(context.line);
		let indent = 0;
		const pat = /^[0-9]\./;
		const start = context.cur;

		const items = [];
		let itemLines = [];

		if (!line || !pat.test(line)) {
			return false;
		}

		indent = 2;
		itemLines.push(line.slice(indent));
		let currentItem = this.makeLiItem(context.cur, 0);
		context.goNextLine();

		while (true) {
			line = stripLineEnd(context.line);
			if (isBlankLine(line) && !context.end) {
				itemLines.push(line.slice(indent));
				context.goNextLine();
				continue;
			}
			if (line.startsWith('  ')) {
				itemLines.push(line.slice(indent));
				context.goNextLine();
				continue;
			}
			if (pat.test(line)) {
				currentItem.length = (context.cur) - currentItem.start;
				currentItem.children = new MdParser().parse(itemLines.join('\n'));
				itemLines = [];
				items.push(currentItem);
				currentItem = this.makeLiItem(context.cur, 0);
				itemLines.push(line.slice(indent));
				context.goNextLine();
				continue;
			}

			currentItem.length = (context.cur) - currentItem.start;
			currentItem.children = new MdParser().parse(itemLines.join('\n'));
			items.push(currentItem);
			itemLines = [];
			break;
		}

		return {
			type: 'containerBlock',
			name: 'orderedList',
			tag: 'ol',
			start,
			escapeEntities: false,
			allowInlines: false,
			length: context.cur - start,
			children: items
		};
	}
}
