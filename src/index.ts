import {MdParser} from './MdParser';
import {BlockquoteState, CodeState, HeadingState, HTMLState, ListState} from './blocks/index';

[BlockquoteState, CodeState, HeadingState, HTMLState, ListState].forEach(k => {
    MdParser.registerParser(k);
});

export default MdParser;