import {IParser} from './IParser';
import {MdParser} from './markdown';
import {MdNode} from './MdNode';

export class ParagraphState implements IParser {
    process(context: MdParser): false | MdNode {
        throw new Error('Method not implemented.');
    }
}