import {MdParser} from './MdParser';
import {MdBlockNode} from "./MdNode";


export interface IParser {
	process(context: MdParser): MdBlockNode | false;
}
