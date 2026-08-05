import 'server-only'

import {Axiom} from '@axiomhq/js'

/** Shared Axiom ingest client, authenticated with the server-only AXIOM_TOKEN. */
const axiomClient = new Axiom({
  token: process.env.AXIOM_TOKEN!
})

export default axiomClient
