import {rootCertificates} from 'tls';

type TextNode = {
    type: 'text',
    value: string,
    parent: RootElement | InlineElement,
};

type ImageNode = {
    type: 'img',
    src: string,
    title: string,
    parent: RootElement | InlineElement,
};

type YoutubeNode = {
    type: 'youtube',
    src: string,
    parent: RootElement | InlineElement,
};

type CodeNode = {
    type: 'code',
    value: string,
    parent: RootElement | InlineElement,
}

type LinkNode = {
    type: 'link',
    href: string,
    title: string,
    parent: RootElement | InlineElement,
}

type LeafElement = TextNode | ImageNode | YoutubeNode | CodeNode | LinkNode;


type RootElement = {
    type: 'root',
    children: (InlineElement | LeafElement)[]
};

type StrongNode = {
    type: 'strong',
    children: (InlineElement | LeafElement)[],
    parent: RootElement | InlineElement,
}

type EmNode = {
    type: 'em',
    children: (InlineElement | LeafElement)[],
    parent: RootElement | InlineElement,
}

type InlineElement = EmNode | StrongNode;
type InlineTypes = 'strong' | 'em';

function isRoot(node: any): node is RootElement {
    return node && 'type' in node && node.type === 'root';
}

function isLeaf(node: any): node is LeafElement {
    return node && 'type' in node && ['img', 'youtube', 'code', 'link', 'text'].includes(node.type);
}

export class InlineParser {
    private line: string = '';
    private root: RootElement;
    private cur: number = 0;
    private curNode: RootElement | InlineElement | LeafElement;
    private state: string = 'root';

    constructor(line: string) {
        this.line = line;
        this.root = {type: 'root', children: []};
        this.curNode = this.root;
    }

    private pushNew(node: InlineElement | LeafElement) {
        while (isLeaf(this.curNode)) {
            this.curNode = this.curNode.parent;
        }
        node.parent = this.curNode;
        this.curNode.children.push(node);
        this.curNode = node;
        this.state = node.type;
    }

    private parsingInline(delimiterLength: number, type: InlineTypes) {
        let node = isLeaf(this.curNode) ? this.curNode.parent : this.curNode;
        const state = node.type;
        this.cur += delimiterLength;
        if (state === type) {
            if (!isRoot(node)) node = node.parent;
            this.state = node.type;
            this.curNode = node;
        } else {
            const newNode: InlineElement = {
                type,
                children: [],
                parent: this.root
            };
            this.pushNew(newNode);
        }
    }

    private checkString(chk: string) {
        return this.line.slice(this.cur, this.cur + chk.length) === chk;
    }

    private getUntil(end: string): string | null {
        const start = this.cur;
        let res = '';
        while (this.cur < this.line.length && !this.checkString(end)) {
            res += this.line[this.cur];
            this.cur++;
        }
        if (this.line[this.cur] !== end) {
            this.cur = start;
            return null;
        }
        return res;
    }

    private parsingLink() {
        const start = this.cur;
        let title = '';
        let href = null;
        this.cur++;

        title = this.getUntil(']');
        this.cur++;
        if (this.line[this.cur] === '(') {
            this.cur++;
            href = this.getUntil(')');
            this.cur++;
        } else if (this.line[this.cur] === '[') {
            this.cur++;
            href = this.getUntil(']');
            this.cur++;
        }
        if (title === null || href === null) {
            this.cur = start;
            this.addText();
            return;
        }

        this.pushNew({
            type: 'link',
            parent: this.root,
            title,
            href,
        } as LinkNode);
    }

    private parsingImage() {
        const start = this.cur -2;
        let desc = '';
        let url = '';
        while (this.cur < this.line.length && this.line[this.cur] !== ']') {
            desc += this.line[this.cur];
            this.cur++;
        }
        this.cur++;
        if (this.line[this.cur] === '(') {
            this.cur++;
            url = this.getUntil(')');
        } else if (this.line[this.cur] === '[') {
            this.cur++;
            url = this.getUntil(']');
        } else {
            this.cur = start;
            this.addText();
            this.addText();
        }
    }

    private addText() {
        while (isLeaf(this.curNode) && this.curNode.type !== 'text') {
            this.curNode = this.curNode.parent;
        }
        if (this.curNode.type !== 'text') {
            this.pushNew({ type: 'text', parent: this.curNode, value: ''} as TextNode );
        }
        if (this.curNode.type === 'text') {
            this.curNode.value += this.line[this.cur];
            this.cur++;
        }
    }

    static parse(line: string) {
        return new this(line).parse();
    }

    parse() {
        const line = this.line;
        const root: RootElement = this.root;
        let curNode: RootElement | InlineElement | LeafElement = root;
        while (this.cur < line.length) {
            const ch = line[this.cur];
            const ch2 = line.slice(this.cur, this.cur + 2);
            if (ch === '\\') {
                this.cur++;
                this.addText();
            } else if (ch2 === '**') {
                this.parsingInline(2, 'strong');
            } else if (ch === '*') {
                this.parsingInline(1, 'em');
            // } else if (ch2 === '![') {

            // } else if (ch2 === '%[') {

            } else if (ch === '[') {
                this.parsingLink();
            } else {
                this.addText();
            }
        }
        return this.root;
    }
}