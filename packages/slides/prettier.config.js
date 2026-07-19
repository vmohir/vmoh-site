/** @type {import("prettier").Options} */
export default {
  proseWrap: "always",
  overrides: [
    {
      files: ["slides.md", "pages/*.md"],
      options: {
        parser: "slidev",
        plugins: ["prettier-plugin-slidev"],
      },
    },
  ],
};
