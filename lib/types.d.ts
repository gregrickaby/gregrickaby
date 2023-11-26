export interface GravatarData {
  entry: Array<GravatarEntry>
}

export interface GravatarEntry {
  hash: string
  requestHash: string
  profileUrl: string
  preferredUsername: string
  thumbnailUrl: string
  photos: Array<{
    value: string
    type: string
  }>
  last_profile_edit: string
  hidden_avatar: boolean
  profileBackground: {
    url: string
  }
  name: {
    givenName: string
    familyName: string
    formatted: string
  }
  displayName: string
  pronouns: string
  aboutMe: string
  currentLocation: string
  emails: Array<{
    primary: string
    value: string
  }>
  accounts: Array<{
    domain: string
    display: string
    url: string
    iconUrl: string
    username: string
    verified: string
    name: string
    shortname: string
  }>
  payments: {
    paypalme: string
    venmo: string
  }
  urls: Array<{
    value: string
    title: string
  }>
  share_flags: {
    search_engines: boolean
    large_language_models: boolean
  }
}
