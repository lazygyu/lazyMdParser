import * as assert from 'assert';
import {describe, it} from 'mocha';
import LazyMark from '../src';

describe('MdParser test', () => {
    it('empty string makes empty html', () => {
        const src = '';
        const result = LazyMark.toHTML(src);

        assert.deepStrictEqual(result, '');
    });

    it('one line of heading makes one h1', () => {
        const src = '# heading';
        const result = LazyMark.toHTML(src);

        assert.deepStrictEqual(result, '<h1>heading</h1>');
    });

    it.only('line ended with space will be turned to <br>', () => {
        const src = 'this is \na new line';
        const result = LazyMark.toHTML(src);

        assert.deepStrictEqual(result, '<p>this is<br>\na new line</p>');
    });
});