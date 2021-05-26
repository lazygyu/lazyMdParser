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

    it('line ended with space will be turned to <br>', () => {
        const src = 'this is \na new line';
        const result = LazyMark.toHTML(src);

        assert.deepStrictEqual(result, '<p>this is<br>\na new line</p>');
    });

    it('escape html special characters in text node', () => {
        const src = 'this is a <code> tag';
        const result = LazyMark.toHTML(src);

        assert.deepStrictEqual(result, '<p>this is a &#60;code&#62; tag</p>');
    });

    it('escape html special characters in strong node', () => {
        const src = 'this is a **<code>** tag';
        const result = LazyMark.toHTML(src);

        assert.deepStrictEqual(result, '<p>this is a <strong>&#60;code&#62;</strong> tag</p>');
    });

    it('escape html special characters in code block', () => {
        const src = 'this is a\n```\n<code>\n```\ntag';
        const result = LazyMark.toHTML(src);

        assert.deepStrictEqual(result, '<p>this is a</p><pre>&#60;code&#62;\n</pre><p>tag</p>');
    });
});