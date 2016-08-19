'use strict'

const Service = require('trails-service')
const npmi = require('npmi')
/**
 * @module PluginService
 * @description Service to manage L.I.S.A. plugins
 */
module.exports = class PluginService extends Service {

  /**
   *
   */
  loadPlugins() {
    return this.app.orm.Plugin.findAll({
      where: {
        activated: true
      }
    }).then(plugins => {
      plugins.forEach(plugin => {
        const pluginClass = require(plugin.name)
        const pluginInstance = new pluginClass(this.app.lisa)
        this.app.packs['lisa-plugins-manager'][pluginInstance.name] = pluginInstance
      })
    })
  }

  /**
   *
   */
  unloadPlugins() {

  }

  activatePlugin(name) {
    const pluginClass = require(name)
    const plugin = new pluginClass(this.app.lisa)

    this.app.packs['lisa-plugins-manager'][plugin.name] = plugin

    return plugin.init().then(_ => {
      return this.app.orm.Plugin.update({
        activated: true
      }, {
        where: {
          name: name
        }
      })
    })
  }

  deactivatePlugin(name) {

  }

  /**
   *
   */
  installPlugin(name) {

    return new Promise((resolve, reject) => {
      npmi({
        name: name
      }, (err, result) => {
        if (err) {
          if (err.code === npmi.LOAD_ERR)    this.log.error('npm load error')
          else if (err.code === npmi.INSTALL_ERR) this.log.error('npm install error')
          this.log.error(err.message)
          return reject(err)
        }

        // installed
        const plugin = require(name+'/package')
        return this.app.orm.Plugin.create({
          name: name,
          version: plugin.version
        }).then(resolve).catch(reject)
      })
    })
  }

  /**
   *
   */
  uninstallPlugin(name) {

  }

}

