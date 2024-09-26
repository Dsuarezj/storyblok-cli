import type { JSONSchema } from "json-schema-to-typescript";

export const getAssetJSONSchema = (title: string): JSONSchema => ({
  $id: "#/asset",
  title,
  type: "object",
  required: ["id", "fieldtype", "filename", "name", "title", "focus", "alt"],
  properties: {
    alt: {
      type: ["string", "null"],
    },
    copyright: {
      type: ["string", "null"],
    },
    fieldtype: {
      type: "string",
      enum: ["asset"],
    },
    id: {
      type: "number",
    },
    filename: {
      type: ["string", "null"],
    },
    name: {
      type: "string",
    },
    title: {
      type: ["string", "null"],
    },
    focus: {
      type: ["string", "null"],
    },
    meta_data: {
      type: "object",
    },
    source: {
      type: ["string", "null"],
    },
    is_external_url: {
      type: "boolean",
    },
    is_private: {
      type: "boolean",
    },
    src: {
      type: "string",
    },
    updated_at: {
      type: "string",
    },
    // Cloudinary integration keys
    width: {
      type: ["number", "null"],
    },
    height: {
      type: ["number", "null"],
    },
    aspect_ratio: {
      type: ["number", "null"],
    },
    public_id: {
      type: ["string", "null"],
    },
    content_type: {
      type: "string",
    },
  },
});

export const getMultiassetJSONSchema = (title: string): JSONSchema => ({
  $id: "#/multiasset",
  title,
  type: "array",
  items: {
    type: "object",
    required: ["id", "fieldtype", "filename", "name", "title", "focus", "alt"],
    properties: {
      alt: {
        type: ["string", "null"],
      },
      copyright: {
        type: ["string", "null"],
      },
      fieldtype: {
        type: "string",
        enum: ["asset"],
      },
      id: {
        type: "number",
      },
      filename: {
        type: ["string", "null"],
      },
      name: {
        type: "string",
      },
      title: {
        type: ["string", "null"],
      },
      focus: {
        type: ["string", "null"],
      },
      meta_data: {
        type: "object",
      },
      source: {
        type: ["string", "null"],
      },
      is_external_url: {
        type: "boolean",
      },
      is_private: {
        type: "boolean",
      },
      src: {
        type: "string",
      },
      updated_at: {
        type: "string",
      },
      // Cloudinary integration keys
      width: {
        type: ["number", "null"],
      },
      height: {
        type: ["number", "null"],
      },
      aspect_ratio: {
        type: ["number", "null"],
      },
      public_id: {
        type: ["string", "null"],
      },
      content_type: {
        type: "string",
      },
    },
  },
});

export const getMultilinkJSONSchema = (title: string): JSONSchema => ({
  $id: "#/multilink",
  title,
  oneOf: [
    {
      type: "object",
      properties: {
        id: {
          type: "string",
        },
        cached_url: {
          type: "string",
        },
        anchor: {
          type: "string",
        },
        linktype: {
          type: "string",
          enum: ["story"],
        },
        target: {
          type: "string",
          enum: ["_self", "_blank"],
        },
        story: {
          type: "object",
          required: ["name", "id", "uuid", "slug", "full_slug"],
          properties: {
            name: {
              type: "string",
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
            published_at: {
              type: "string",
              format: "date-time",
            },
            id: {
              type: "integer",
            },
            uuid: {
              type: "string",
              format: "uuid",
            },
            content: {
              type: "object",
            },
            slug: {
              type: "string",
            },
            full_slug: {
              type: "string",
            },
            sort_by_date: {
              type: ["null", "string"],
              format: "date-time",
            },
            position: {
              type: "integer",
            },
            tag_list: {
              type: "array",
              items: {
                type: "string",
              },
            },
            is_startpage: {
              type: "boolean",
            },
            parent_id: {
              type: ["null", "integer"],
            },
            meta_data: {
              type: ["null", "object"],
            },
            group_id: {
              type: "string",
              format: "uuid",
            },
            first_published_at: {
              type: "string",
              format: "date-time",
            },
            release_id: {
              type: ["null", "integer"],
            },
            lang: {
              type: "string",
            },
            path: {
              type: ["null", "string"],
            },
            alternates: {
              type: "array",
            },
            default_full_slug: {
              type: ["null", "string"],
            },
            translated_slugs: {
              type: ["null", "array"],
            },
          },
        },
      },
    },
    {
      type: "object",
      properties: {
        url: {
          type: "string",
        },
        cached_url: {
          type: "string",
        },
        anchor: {
          type: "string",
        },
        linktype: {
          type: "string",
          enum: ["asset", "url"],
        },
        target: {
          type: "string",
          enum: ["_self", "_blank"],
        },
      },
    },
    {
      type: "object",
      properties: {
        email: {
          type: "string",
        },
        linktype: {
          type: "string",
          enum: ["email"],
        },
        target: {
          type: "string",
          enum: ["_self", "_blank"],
        },
      },
    },
  ],
});

export const getRichtextJSONSchema = (title: string): JSONSchema => ({
  $id: "#/richtext",
  title,
  type: "object",
  required: ["type"],
  properties: {
    type: {
      type: "string",
    },
    content: {
      type: "array",
      items: {
        $ref: "#",
      },
    },
    marks: {
      type: "array",
      items: {
        $ref: "#",
      },
    },
    attrs: {},
    text: {
      type: "string",
    },
  },
});

export const getTableJSONSchema = (title: string): JSONSchema => ({
  $id: "#/table",
  title,
  type: "object",
  required: ["tbody", "thead"],
  properties: {
    thead: {
      type: "array",
      items: {
        type: "object",
        required: ["_uid", "component"],
        properties: {
          _uid: {
            type: "string",
          },
          value: {
            type: "string",
          },
          component: {
            type: "number",
          },
        },
      },
    },
    tbody: {
      type: "array",
      items: {
        type: "object",
        required: ["_uid", "component", "body"],
        properties: {
          _uid: {
            type: "string",
          },
          body: {
            type: "array",
            items: {
              type: "object",
              properties: {
                _uid: {
                  type: "string",
                },
                value: {
                  type: "string",
                },
                component: {
                  type: "number",
                },
              },
            },
          },
          component: {
            type: "number",
          },
        },
      },
    },
  },
});
