// src/tools/index.js - MCP工具定义
const addModule = require('./addModule');
const addApi = require('./addApi');
const updateModule = require('./updateModule');
const updateApi = require('./updateApi');
const listModules = require('./listModules');
const listApis = require('./listApis');
const getModuleDetails = require('./getModuleDetails');
const getApiDetails = require('./getApiDetails');
const list = require('./list');

module.exports = {
  addModule,
  addApi,
  updateModule,
  updateApi,
  listModules,
  listApis,
  getModuleDetails,
  getApiDetails,
  list
};