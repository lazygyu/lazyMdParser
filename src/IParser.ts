import {MdParser} from './markdown';
import {MdNode} from "./MdNode";


export interface IParser {
	process(context: MdParser): MdNode | false;
}
