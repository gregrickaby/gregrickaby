import {Threads} from '@/lib/types'

export const mockEmptyThreads: Threads = {
  data: [],
  paging: {
    cursors: {
      before: '',
      after: ''
    },
    next: ''
  }
}

export const mockThreads: Threads = {
  data: [
    {
      id: '18041823712779396',
      media_product_type: 'THREADS',
      media_type: 'IMAGE',
      media_url:
        'https://scontent-atl3-1.cdninstagram.com/v/t51.29350-15/453769781_1165705561342861_3077480464820431675_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=18de74&_nc_ohc=nRWYYqypj0oQ7kNvgErE_Lc&_nc_ht=scontent-atl3-1.cdninstagram.com&edm=ACx9VUEEAAAA&oh=00_AYBVVGC6uLoGHbwqC5kMNBcEHVYPpneWytiQ5AC-BW6y2w&oe=66B3F393',
      permalink: 'https://www.threads.net/@gregoryrickaby/post/C-JoHZrOlcr',
      text: 'Taking advantage of the new moon! Milky Way from my front yard',
      timestamp: '2024-08-02T02:15:36+0000',
      username: 'gregoryrickaby',
      is_quote_post: false
    },
    {
      id: '17877866304054860',
      media_product_type: 'THREADS',
      media_type: 'IMAGE',
      media_url:
        'https://scontent-atl3-1.cdninstagram.com/v/t51.29350-15/453259251_503995798667592_3625227248165730293_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=18de74&_nc_ohc=46uSKISPRVkQ7kNvgEY2ddI&_nc_ht=scontent-atl3-1.cdninstagram.com&edm=ACx9VUEEAAAA&oh=00_AYDm265xezWddW7GUpVbRMwgEbMmNzvJyuskddCXhcsuTw&oe=66B3CB08',
      permalink: 'https://www.threads.net/@gregoryrickaby/post/C-G8DEMR9Q9',
      text: 'My youngest yelled, “it’s the zombie apocalypse!” stormyweather',
      timestamp: '2024-08-01T01:12:03+0000',
      username: 'gregoryrickaby',
      is_quote_post: false
    },
    {
      id: '18033766946287338',
      media_product_type: 'THREADS',
      media_type: 'IMAGE',
      media_url:
        'https://scontent-atl3-1.cdninstagram.com/v/t51.29350-15/452937348_526651603050710_3094736639257777462_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=18de74&_nc_ohc=KVJHOvmacecQ7kNvgHYSpNQ&_nc_ht=scontent-atl3-1.cdninstagram.com&edm=ACx9VUEEAAAA&oh=00_AYBXIiM3xGOzCqEoyvBh8z-_DDhLfGSAGy5YtZKTeg4BZg&oe=66B3CC28',
      permalink: 'https://www.threads.net/@gregoryrickaby/post/C91FaqfsRAq',
      text: 'Who wants hugs?',
      timestamp: '2024-07-25T02:47:35+0000',
      username: 'gregoryrickaby',
      is_quote_post: false
    },
    {
      id: '17854511658209937',
      media_product_type: 'THREADS',
      media_type: 'IMAGE',
      media_url:
        'https://scontent-atl3-1.cdninstagram.com/v/t39.30808-6/449195864_18439774633004645_5040392547010828344_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=18de74&_nc_ohc=6YpL6AguGZAQ7kNvgE3kRKJ&_nc_ht=scontent-atl3-1.cdninstagram.com&edm=ACx9VUEEAAAA&oh=00_AYDdRd50T67gEVWGXoKS5IDit4QWkKfeBoXRaXhUzvxyyw&oe=66B3F128',
      permalink: 'https://www.threads.net/@gregoryrickaby/post/C8s0eeER8Qy',
      text: 'Hello dark sky season! 👀🌌📷',
      timestamp: '2024-06-27T01:14:15+0000',
      username: 'gregoryrickaby',
      is_quote_post: false
    },
    {
      id: '17999648705391452',
      media_product_type: 'THREADS',
      media_type: 'CAROUSEL_ALBUM',
      media_url:
        'https://scontent-atl3-1.cdninstagram.com/v/t39.30808-6/448399927_18437829799004645_8126595902947242612_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=18de74&_nc_ohc=raCixRpmvRUQ7kNvgE-wQjj&_nc_ht=scontent-atl3-1.cdninstagram.com&edm=ACx9VUEEAAAA&oh=00_AYBpOpkg0bqotEfIYBq4Y0bEr9PSk4cI2fckDnT-5L8Vng&oe=66B3E93B',
      permalink: 'https://www.threads.net/@gregoryrickaby/post/C8R86zJxdbC',
      text: 'Happy Birthday @chefboyarecee!!! 1️⃣9️⃣',
      timestamp: '2024-06-16T14:48:31+0000',
      children: {
        data: [
          {
            id: '17978322440568039'
          },
          {
            id: '17877334920093291'
          },
          {
            id: '18063593212505347'
          },
          {
            id: '18035969659817989'
          }
        ]
      },
      username: 'gregoryrickaby',
      is_quote_post: false
    }
  ],
  paging: {
    cursors: {
      before:
        'QVFIUms1M1hHYlp5dkhYcnYxTEdkT0VDT2s2LU5BejI4NnV3eEFhemQyeG9RbTFidktIa2tEZAkU3UHZAqSFliSC04V3FsZAFNnb2N3czRvNjJkazVFdERSWGp3',
      after:
        'QVFIUmdWNmVURG11VmhGd1Y1ZA0lvdms3a25BM2VZAVldaeTZATbGJERVFyeDRpMUNPcmRmUzZAfV3poQ1loQ1dZAM1hvTDdCOG9iaFpIWEQ0TzVodmNCUFB3ZAE9n'
    },
    next: 'https://graph.threads.net/v1.0/17841463292731886/threads?fields=id,media_product_type,media_type,media_url,permalink,text,timestamp,children,username&limit=5&access_token=THQWJXZA2I5OEEweHd1NkhmQlRlTVp4bTkxYVZA4eHdoR1lNdXpnTUVBN1JyQTVKdC1xZA0JIQzRxWlE5cDlCNGZAJZAWRab3hRSXctd3FvaTJSSGd3WHVuMThibElPUGFMeC14X1RvWFdMN3M1MEtKX1lVQU9WLTlGTy1uVHcZD&after=QVFIUmdWNmVURG11VmhGd1Y1ZA0lvdms3a25BM2VZAVldaeTZATbGJERVFyeDRpMUNPcmRmUzZAfV3poQ1loQ1dZAM1hvTDdCOG9iaFpIWEQ0TzVodmNCUFB3ZAE9n'
  }
}
