export type TextNode = {
    type: 'text',
    value: string,
    parent: RootElement | InlineElement,
};

export type ImageNode = {
    type: 'img',
    src: string,
    title: string,
    parent: RootElement | InlineElement,
};

export type YoutubeNode = {
    type: 'youtube',
    src: string,
    parent: RootElement | InlineElement,
};

export type CodeNode = {
    type: 'code',
    value: string,
    parent: RootElement | InlineElement,
}

export type LinkNode = {
    type: 'link',
    href: string,
    title: string,
    parent: RootElement | InlineElement,
}

export type LeafElement = TextNode | ImageNode | YoutubeNode | CodeNode | LinkNode;


export type RootElement = {
    type: 'root',
    children: (InlineElement | LeafElement)[]
};

export type StrongNode = {
    type: 'strong',
    children: (InlineElement | LeafElement)[],
    parent: RootElement | InlineElement,
}

export type EmNode = {
    type: 'em',
    children: (InlineElement | LeafElement)[],
    parent: RootElement | InlineElement,
}

export type InlineElement = EmNode | StrongNode;
export type InlineTypes = 'strong' | 'em';

export type MdInlineNode = RootElement | LeafElement | InlineElement;

export function isInline(node: any): node is MdInlineNode {
    return node && 'type' in node && ['img', 'youtube', 'code', 'link', 'text', 'em', 'strong', 'root'].includes(node.type);
}

export function isRoot(node: any): node is RootElement {
    return node && 'type' in node && node.type === 'root';
}

export function isLeaf(node: any): node is LeafElement {
    return node && 'type' in node && ['img', 'youtube', 'code', 'link', 'text'].includes(node.type);
}
export type MdBlockNode = {
	type: 'block' | 'inline' | 'containerBlock';
	name: string;
	tag: string;
	start: number;
	length: number;
	content?: string;
	allowInlines: boolean;
	children?: MdBlockNode[];
	contentRoot?: RootElement;
};

export function isBlockNode(node: any): node is MdBlockNode {
	return node && ['type', 'name', 'tag', 'start', 'length', 'children'].every(key => key in node);
}