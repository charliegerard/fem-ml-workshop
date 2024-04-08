import { Tag } from "@markdoc/markdoc";

import { Image } from "../../components";

export const image = {
  render: Image,
  attributes: {
    src: {
      type: String,
    },
  },
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);

    return new Tag(this.render, { ...attributes }, children);
  },
};
