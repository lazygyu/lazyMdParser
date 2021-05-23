
export type MdNode = {
	type: 'block' | 'inline' | 'containerBlock';
	name: string;
	tag: string;
	start: number;
	length: number;
	content?: string;
	allowInlines: boolean;
	children?: MdNode[];
};
