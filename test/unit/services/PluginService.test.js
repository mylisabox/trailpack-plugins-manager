'use strict'
/* global describe, it */

const assert = require('assert')
const chai = require('chai')
chai.use(require('chai-fs'))
const expect = chai.expect

describe('PluginService', () => {
  const pluginName = 'lisa-plugin-example'
  const internalPluginName = 'example'
  const version = '0.0.3'

  let service
  it('should exist', () => {
    assert(global.app.api.services['PluginService'])
    assert(service = global.app.services.PluginService)
  })

  it('should install a plugin', () => {
    return service.installPlugin(pluginName, version)
      .then(plugin => {
        assert(plugin.version)
        assert.equal(plugin.name, pluginName)
        assert.equal(plugin.internalName, internalPluginName)
        assert.equal(plugin.camelName, internalPluginName.toCamelCase())
        assert.equal(plugin.activated, false)
        expect('./plugins/' + pluginName).to.be.a.directory()
      })
  })

  it('should deactivate a plugin', () => {
    return service.disablePlugin(pluginName)
      .then(pluginIds => {
        assert.equal(pluginIds.length, 1)
        assert.equal(pluginIds[0], 1)
      })
  })

  it('should activate a plugin', () => {
    return service.enablePlugin(pluginName)
      .then(pluginIds => {
        assert.equal(pluginIds.length, 1)
        assert.equal(pluginIds[0], 1)
      })
  })

  it('should be load when server start', () => {
    return global.app.stop().then(_ => {
      global.app.config.database.models.migrate = 'alter' //override drop to keep saved plugin
      return global.app.start().then(_ => {
        const plugin = global.app.packs.pluginsManager[internalPluginName]
        assert(plugin)
        assert(plugin.config)
        assert(plugin.pkg)
        assert(plugin.lisa)
        assert(plugin.log)
        assert.equal(plugin.name, internalPluginName)
      })
    })
  })

  it('should uninstall the plugin', () => {
    return service.uninstallPlugin(pluginName)
      .then(nbRemoved => {
        const plugin = global.app.packs.pluginsManager[internalPluginName]
        assert(!plugin)
        assert.equal(nbRemoved, 1)
        expect('./plugins/' + pluginName).to.not.be.a.path()
      })
  })
})
