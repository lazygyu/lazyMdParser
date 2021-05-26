import * as assert from 'assert';
import {describe, it} from 'mocha';
import {InlineParser} from '../src/InlineParser';

describe('Inline parser Test', () => {
    let root = null;

    beforeEach(() => {
        root = {type: 'root', children: []};
    });

    it('plain text produces text node', () => {
        const line = 'this is a test line\n';
        const result = InlineParser.parse(line);

        const tNode = {type: 'text', value: line, parent: root};
        root.children.push(tNode);
        assert.deepStrictEqual(result, root);
    });

    it('strong text produces strong node', () => {
        const line = '**this is strong value**';
        const result = InlineParser.parse(line);

        const strongNode = {
            type: 'strong',
            children: [],
            parent: root
        };

        strongNode.children.push({
            type: 'text',
            value: 'this is strong value',
            parent: strongNode
        });

        root.children.push(strongNode);
        assert.deepStrictEqual(result, root);
    });

    it('plain text with strong produce text and strong node', () => {
        const line = 'plain **strong** plain\n';
        const result = InlineParser.parse(line);

        root.children.push({
            type: 'text',
            value: 'plain ',
            parent: root,
        }); 

        const strongNode = {
            type: 'strong',
            children: [],
            parent: root
        };

        strongNode.children.push({
            type: 'text',
            value: 'strong',
            parent: strongNode
        });

        root.children.push(strongNode);

        root.children.push({
            type: 'text',
            value: ' plain\n',
            parent: root,
        });

        assert.deepStrictEqual(result, root);
    });

    it('link text produces link node', () => {
        const line = '[title](url)';
        const result = InlineParser.parse(line);

        const link = {
            type: 'link',
            href: 'url',
            title: 'title',
            parent: root,
        };
        root.children.push(link);

        assert.deepStrictEqual(result, root);
    });

    it('wrong link text produces text node', () => {
        const line = '[title](url]';
        const result = InlineParser.parse(line);

        const txt = {
            type: 'text',
            parent: root,
            value: line
        };
        root.children.push(txt);
        assert.deepStrictEqual(result, root);
    });

    it('link in strong', () => {
        const line = '**[title](url)plainText**';
        const result = InlineParser.parse(line);

        const strong = {
            type: 'strong',
            children: [],
            parent: root,
        };

        const link = {
            type: 'link',
            title: 'title',
            href: 'url',
            parent: strong
        };

        const txt = {
            type: 'text',
            value: 'plainText',
            parent: strong
        };

        strong.children.push(link, txt);
        root.children.push(strong);

        assert.deepStrictEqual(result, root);
    });

    it('image can be parsed', () => {
        const line = '![title](url)';
        const result = InlineParser.parse(line);

        const img = {
            type: 'img',
            src: 'url',
            title: 'title',
            parent: root
        };
        root.children.push(img);

        assert.deepStrictEqual(result, root);
    });

    it('youtube movie can be parsed', () => {
        const line = '%[youtube]';
        const result = InlineParser.parse(line);

        const youtube = {
            type: 'youtube',
            src: 'youtube',
            parent: root,
        };

        root.children.push(youtube);

        assert.deepStrictEqual(result, root);
    });

    it('inline code parsing', () => {
        const line = '`code`';
        const result = InlineParser.parse(line);

        const code = {
            type: 'code',
            value: 'code',
            parent: root
        };
        root.children.push(code);

        assert.deepStrictEqual(result, root);
    });
});