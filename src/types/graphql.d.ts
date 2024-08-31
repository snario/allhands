// src/types/graphql.d.ts
declare module "*.graphql" {
    const content: object & { loc: { source: { body: string } } };
    export default content;
}
