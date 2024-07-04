import { getRegionApiEndpoint } from '../src/utils/region'
import { EU_CODE } from '@storyblok/region-helper'
export const EMAIL_TEST = 'test@storyblok.com'
export const PASSWORD_TEST = 'test'
export const TOKEN_TEST = 'storyblok1234'
export const REGION_TEST = EU_CODE

// use functions to always returns 'new' data
export const FAKE_COMPONENTS = () => [
  {
    name: 'teaser',
    display_name: null,
    created_at: '2019-10-15T17:00:32.212Z',
    id: 0,
    schema: {
      headline: {
        type: 'text'
      }
    },
    image: null,
    preview_field: null,
    is_root: false,
    preview_tmpl: null,
    is_nestable: true,
    all_presets: [],
    internal_tag_ids: [],
    internal_tags_list: [],
    preset_id: null,
    real_name: 'teaser',
    component_group_uuid: null
  },
  {
    name: 'feature',
    display_name: null,
    created_at: '2019-11-06T17:07:04.196Z',
    updated_at: '2019-11-06T18:12:29.136Z',
    id: 1,
    schema: {
      logo: {
        type: 'image'
      },
      name: {
        type: 'text'
      },
      description: {
        type: 'textarea'
      },
      link_text: {
        type: 'text'
      },
      link: {
        type: 'multilink'
      }
    },
    image: null,
    preview_field: null,
    is_root: false,
    preview_tmpl: null,
    is_nestable: true,
    all_presets: [],
    internal_tag_ids: [],
    internal_tags_list: [],
    preset_id: null,
    real_name: 'feature',
    component_group_uuid: null
  },
  {
    name: 'logo',
    display_name: null,
    id: 1,
    schema: {
      image: {
        type: 'image'
      }
    },
    image: null,
    preview_field: null,
    is_root: false,
    preview_tmpl: null,
    is_nestable: true,
    all_presets: [],
    internal_tag_ids: [],
    internal_tags_list: [],
    preset_id: null,
    real_name: 'logo',
    component_group_uuid: '529cc32a-1d97-4b4a-b0b6-28e33dc56c0d'
  },
  {
    name: 'blocks',
    display_name: null,
    id: 2,
    schema: {
      other: {
        type: 'bloks',
        max_length: '',
        translatable: false,
        restrict_components: true,
        restrict_type: 'groups',
        component_group_whitelist: [
          '529cc32a-1d97-4b4a-b0b6-28e33dc56c0d'
        ]
      }
    },
    image: null,
    preview_field: null,
    is_root: false,
    preview_tmpl: null,
    is_nestable: true,
    all_presets: [],
    internal_tag_ids: [],
    internal_tags_list: [],
    preset_id: null,
    real_name: 'blocks',
    component_group_uuid: null
  },
  {
    name: 'hero',
    display_name: null,
    created_at: '2020-07-20T20:10:00.655Z',
    updated_at: '2020-07-20T20:10:00.655Z',
    id: 3,
    schema: {
      title: {
        type: 'text'
      },
      subtitle: {
        type: 'text'
      }
    },
    image: null,
    preview_field: null,
    is_root: false,
    preview_tmpl: null,
    is_nestable: true,
    all_presets: [
      {
        id: '01',
        name: 'Hero Variant 1',
        component_id: 3,
        image: null
      }
    ],
    internal_tag_ids: [],
    internal_tags_list: [],
    preset_id: null,
    real_name: 'hero',
    component_group_uuid: null
  }
]

// use functions to always returns 'new' data
export const FAKE_STORIES = () => [
  {
    name: 'About',
    id: 0,
    uuid: '5ebd1485-25c5-460f-b477-b41facc884f8',
    content: {
      _uid: '4bc98f32-6200-4176-86b0-b6f2ea14be6f',
      body: [
        {
          _uid: '111781de-3174-4f61-8ae3-0b653085a582',
          headline: 'My About Page',
          component: 'teaser'
        }
      ],
      component: 'page'
    },
    slug: 'about',
    full_slug: 'about',
    published: true,
    unpublished_changes: true
  },
  {
    name: 'Home',
    id: 1,
    uuid: '5ebd1485-25c5-460f-b477-b41facc884f8',
    content: {
      _uid: '4bc98f32-6200-4176-86b0-b6f2ea14be6f',
      body: [
        {
          _uid: '111781de-3174-4f61-8ae3-0b653085a582',
          headline: 'Hello World!',
          component: 'teaser'
        },
        {
          _uid: '2aae2a9b-df65-4572-be4c-e4460d81e299',
          columns: [
            {
              _uid: 'cd6efa74-31c3-47ec-96d2-91111f2a6c7c',
              name: 'Feature 1',
              component: 'feature',
              image_data: '//a.storyblok.com/f/67249/1024x512/64e7272404/headless.png'
            },
            {
              _uid: 'e994cb3e-0f2b-40a7-8db1-f3e456e7b868',
              name: 'Feature 2',
              component: 'feature'
            },
            {
              _uid: '779ee42f-a856-405c-9e34-5b49380ae4fe',
              name: 'Feature 3',
              component: 'feature'
            },
            {
              _uid: 'a315e9a7-4a0c-4cc5-b393-572533e8bf87',
              image: '//a.storyblok.com/f/67249/1024x512/64e7272404/headless.png',
              component: 'my-image'
            }
          ],
          component: 'grid'
        }
      ],
      component: 'page'
    },
    slug: 'home',
    full_slug: 'home',
    published: true,
    unpublished_changes: false
  }
]

export const FAKE_SPACES = () => [
  {
    name: 'Example Space',
    domain: 'https://example.storyblok.com',
    uniq_domain: null,
    plan: 'starter',
    plan_level: 0,
    limits: {},
    created_at: '2018-11-10T15:33:18.402Z',
    id: 0
  },
  {
    name: 'Example Space Two',
    domain: 'https://example-two.storyblok.com',
    uniq_domain: null,
    plan: 'starter',
    plan_level: 0,
    limits: {},
    created_at: '2018-11-10T15:33:18.402Z',
    id: 1
  }
]

export const FAKE_SPACE_OPTIONS = () => ({
  languages: [
    {
      code: 'pt',
      name: 'Português'
    },
    {
      code: 'nl-be',
      name: 'Dutch (Belgian)'
    }
  ],
  hosted_backup: false,
  onboarding_step: '3',
  default_lang_name: 'English',
  rev_share_enabled: true,
  required_assest_fields: [],
  use_translated_stories: false
})

export const FAKE_PRESET = () => ({
  id: 123,
  name: 'page_preset',
  preset: {
    _uid: '7dce995b-07ed-4e5b-a4bb-5d22447252d8',
    body: [
      {
        _uid: '995e84c1-a08d-45cd-b121-e4db45e9cf50',
        headline: 'Hello world!',
        component: 'teaser'
      },
      {
        _uid: 'a6e118ec-1a57-4f0f-b1e9-1ed625a82751',
        columns: [
          {
            _uid: '9b0a9bed-e891-4edc-8f5e-bc29e7ec785c',
            name: 'Feature 1',
            component: 'feature'
          },
          {
            _uid: '07863609-7518-48b9-8d28-b1e8037818e2',
            name: 'Feature 2',
            component: 'feature'
          }
        ],
        component: 'grid'
      }
    ],
    component: 'page'
  },
  component_id: 3481284,
  space_id: 200378,
  created_at: '2023-02-24T16:49:14.723Z',
  updated_at: '2023-02-24T16:49:14.723Z',
  image: '',
  color: '',
  icon: '',
  description: 'page preset'
})

export const USERS_ROUTES = {
  LOGIN: `${getRegionApiEndpoint(EU_CODE)}users/login`,
  SIGNUP: `${getRegionApiEndpoint(EU_CODE)}users/signup`
}
