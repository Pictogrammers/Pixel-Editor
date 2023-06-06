import { Color } from "./color";
import { Guide } from "./guide";
import { Template } from "./template";

export type Project = {
    id: string;
    name: string;
    icon: string,
    colors: Color[],
    width: number,
    height: number,
    templates: Template[],
    guides: Guide[]
}