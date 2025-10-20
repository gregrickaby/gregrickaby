import type {CodegenConfig} from '@graphql-codegen/cli'

const config: CodegenConfig = {
  overwrite: true,
  schema:
    process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'http://localhost/graphql',
  documents: 'lib/wordpress/queries/**/*.ts',
  generates: {
    'lib/wordpress/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
      config: {
        skipTypename: false,
        enumsAsTypes: true,
        futureProofEnums: true,
        dedupeFragments: true,
        nonOptionalTypename: true,
        scalars: {
          DateTime: 'string',
          Date: 'string',
          JSON: 'Record<string, unknown>'
        }
      }
    }
  },
  hooks: {
    afterAllFileWrite: ['prettier --write']
  }
}

export default config
