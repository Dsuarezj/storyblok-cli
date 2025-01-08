import { ofetch } from 'ofetch'
import { handleAPIError, handleFileSystemError, slugify } from '../../utils'
import { regionsDomain } from '../../constants'
import { join } from 'node:path'
import { resolvePath, saveToFile } from '../../utils/filesystem'
import type { PullComponentsOptions } from './constants'

export interface SpaceComponent {
  name: string
  display_name: string
  created_at: string
  updated_at: string
  id: number
  schema: Record<string, unknown>
  image?: string
  preview_field?: string
  is_root?: boolean
  is_nestable?: boolean
  preview_tmpl?: string
  all_presets?: Record<string, unknown>
  preset_id?: number
  real_name?: string
  component_group_uuid?: string
  color: null
  internal_tags_list: string[]
  interntal_tags_ids: number[]
  content_type_asset_preview?: string
}

export interface SpaceComponentGroup {
  name: string
  id: number
  uuid: string
  parent_id: number
  parent_uuid: string
}

export interface ComponentsSaveOptions {
  path?: string
  filename?: string
  separateFiles?: boolean
  suffix?: string
}

export interface SpaceComponentPreset {
  id: number
  name: string
  preset: Record<string, unknown>
  component_id: number
  space_id: number
  created_at: string
  updated_at: string
  image: string
  color: string
  icon: string
  description: string
}

export interface SpaceData {
  components: SpaceComponent[]
  groups: SpaceComponentGroup[]
  presets: SpaceComponentPreset[]
}
/**
 * Resolves the nested folder structure based on component group hierarchy.
 * @param groupUuid - The UUID of the component group.
 * @param groups - The list of all component groups.
 * @returns The resolved path for the component group.
 */
const resolveGroupPath = (groupUuid: string, groups: SpaceComponentGroup[]): string => {
  const group = groups.find(g => g.uuid === groupUuid)
  if (!group) { return '' }
  const parentPath = group.parent_uuid ? resolveGroupPath(group.parent_uuid, groups) : ''
  return join(parentPath, slugify(group.name))
}

export const fetchComponents = async (space: string, token: string, region: string): Promise<SpaceComponent[] | undefined> => {
  try {
    const response = await ofetch(`https://${regionsDomain[region]}/v1/spaces/${space}/components`, {
      headers: {
        Authorization: token,
      },
    })
    return response.components
  }
  catch (error) {
    handleAPIError('pull_components', error as Error)
  }
}

export const fetchComponentGroups = async (space: string, token: string, region: string): Promise<SpaceComponentGroup[] | undefined> => {
  try {
    const response = await ofetch(`https://${regionsDomain[region]}/v1/spaces/${space}/component_groups`, {
      headers: {
        Authorization: token,
      },
    })
    return response.component_groups
  }
  catch (error) {
    handleAPIError('pull_component_groups', error as Error)
  }
}

export const fetchComponentPresets = async (space: string, token: string, region: string): Promise<SpaceComponentPreset[] | undefined> => {
  try {
    const response = await ofetch(`https://${regionsDomain[region]}/v1/spaces/${space}/presets`, {
      headers: {
        Authorization: token,
      },
    })
    return response.presets
  }
  catch (error) {
    handleAPIError('pull_component_presets', error as Error)
  }
}

export const saveComponentsToFiles = async (
  space: string,
  spaceData: SpaceData,
  options: PullComponentsOptions,
) => {
  const { components, groups, presets } = spaceData
  const { filename = 'components', suffix, path, separateFiles } = options
  const resolvedPath = resolvePath(path, space)

  try {
    if (separateFiles) {
      // Save in separate files without nested structure
      for (const component of components) {
        const componentFilePath = join(resolvedPath, suffix ? `${component.name}.${suffix}.json` : `${component.name}.json`)
        await saveToFile(componentFilePath, JSON.stringify(component, null, 2))

        // Find and save associated presets
        const componentPresets = presets.filter(preset => preset.component_id === component.id)
        if (componentPresets.length > 0) {
          const presetsFilePath = join(resolvedPath, suffix ? `${component.name}.presets.${suffix}.json` : `${component.name}.presets.json`)
          await saveToFile(presetsFilePath, JSON.stringify(componentPresets, null, 2))
        }
      }
      return
    }

    // Default to saving consolidated files
    const componentsFilePath = join(resolvedPath, suffix ? `${filename}.${suffix}.json` : `${filename}.json`)
    await saveToFile(componentsFilePath, JSON.stringify(components, null, 2))

    if (groups.length > 0) {
      const groupsFilePath = join(resolvedPath, suffix ? `groups.${suffix}.json` : `groups.json`)
      await saveToFile(groupsFilePath, JSON.stringify(groups, null, 2))
    }

    if (presets.length > 0) {
      const presetsFilePath = join(resolvedPath, suffix ? `presets.${suffix}.json` : `presets.json`)
      await saveToFile(presetsFilePath, JSON.stringify(presets, null, 2))
    }
  }
  catch (error) {
    handleFileSystemError('write', error as Error)
  }
}
