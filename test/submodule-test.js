// test/submodule-test.js - 子模块功能测试脚本
const { StorageManager } = require('../src/storage');
const { DocumentGenerator } = require('../src/document');
const { SyncEngine } = require('../src/sync');
const fs = require('fs').promises;
const path = require('path');
const assert = require('assert');

// 测试配置
const config = {
  dataDir: path.join(__dirname, 'test-data'),
  docsDir: path.join(__dirname, 'test-docs')
};

// 清理测试目录
async function cleanup() {
  try {
    await fs.rm(config.dataDir, { recursive: true, force: true });
    await fs.rm(config.docsDir, { recursive: true, force: true });
  } catch (error) {
    // 忽略目录不存在的错误
  }
}

// 测试用例
async function runTests() {
  try {
    // 清理测试环境
    await cleanup();
    
    console.log('开始子模块功能测试...');
    
    // 创建存储管理器
    const storage = new StorageManager(config);
    const docGen = new DocumentGenerator(config);
    const syncEngine = new SyncEngine(config);
    
    // 测试1: 创建顶级模块
    console.log('测试1: 创建顶级模块');
    const parentModuleId = await storage.createModule({
      moduleName: 'parent',
      description: '父模块'
    });
    
    // 验证顶级模块创建成功
    const parentModule = await storage.getModule(parentModuleId);
    assert(parentModule, '父模块创建失败');
    assert(parentModule.moduleName === 'parent', '父模块名称不正确');
    assert(Array.isArray(parentModule.subModules), '子模块列表应该是数组');
    assert(parentModule.subModules.length === 0, '初始子模块列表应该为空');
    
    // 测试2: 在父模块下创建子模块
    console.log('测试2: 在父模块下创建子模块');
    const childModuleId = await storage.createSubModule(parentModuleId, {
      moduleName: 'child',
      description: '子模块'
    });
    
    // 验证子模块创建成功
    const childModule = await storage.getModule(childModuleId);
    assert(childModule, '子模块创建失败');
    assert(childModule.moduleName === 'child', '子模块名称不正确');
    assert(childModule.parentModuleId === parentModuleId, '子模块的父模块ID不正确');
    
    // 验证父模块的子模块列表已更新
    const updatedParentModule = await storage.getModule(parentModuleId);
    assert(updatedParentModule.subModules.length === 1, '父模块的子模块列表未更新');
    assert(updatedParentModule.subModules[0].moduleId === childModuleId, '子模块ID不正确');
    
    // 测试3: 通过路径获取子模块
    console.log('测试3: 通过路径获取子模块');
    const moduleByPath = await storage.getModuleByPath('parent/child');
    assert(moduleByPath, '通过路径获取子模块失败');
    assert(moduleByPath.moduleId === childModuleId, '通过路径获取的模块ID不正确');
    
    // 测试4: 在子模块下创建孙模块
    console.log('测试4: 在子模块下创建孙模块');
    const grandchildModuleId = await storage.createSubModule(childModuleId, {
      moduleName: 'grandchild',
      description: '孙模块'
    });
    
    // 验证孙模块创建成功
    const grandchildModule = await storage.getModule(grandchildModuleId);
    assert(grandchildModule, '孙模块创建失败');
    assert(grandchildModule.moduleName === 'grandchild', '孙模块名称不正确');
    assert(grandchildModule.parentModuleId === childModuleId, '孙模块的父模块ID不正确');
    
    // 测试5: 通过多级路径获取孙模块
    console.log('测试5: 通过多级路径获取孙模块');
    const grandchildByPath = await storage.getModuleByPath('parent/child/grandchild');
    assert(grandchildByPath, '通过路径获取孙模块失败');
    assert(grandchildByPath.moduleId === grandchildModuleId, '通过路径获取的孙模块ID不正确');
    
    // 测试6: 移动子模块
    console.log('测试6: 移动子模块');
    // 创建另一个顶级模块
    const anotherParentId = await storage.createModule({
      moduleName: 'another',
      description: '另一个父模块'
    });
    
    // 将孙模块移动到另一个父模块下
    await storage.moveSubModule(grandchildModuleId, anotherParentId);
    
    // 验证移动成功
    const movedGrandchild = await storage.getModule(grandchildModuleId);
    assert(movedGrandchild.parentModuleId === anotherParentId, '移动后的父模块ID不正确');
    
    // 验证原父模块的子模块列表已更新
    const updatedChildModule = await storage.getModule(childModuleId);
    assert(updatedChildModule.subModules.length === 0, '原父模块的子模块列表未更新');
    
    // 验证新父模块的子模块列表已更新
    const updatedAnotherParent = await storage.getModule(anotherParentId);
    assert(updatedAnotherParent.subModules.length === 1, '新父模块的子模块列表未更新');
    assert(updatedAnotherParent.subModules[0].moduleId === grandchildModuleId, '新父模块的子模块ID不正确');
    
    // 测试7: 文档生成
    console.log('测试7: 文档生成');
    // 生成父模块文档
    await docGen.generateModuleDoc(parentModuleId);
    
    // 验证文档生成成功
    const parentDocPath = path.join(config.docsDir, 'modules', 'parent.md');
    const parentDocExists = await fileExists(parentDocPath);
    assert(parentDocExists, '父模块文档未生成');
    
    // 生成子模块文档
    await docGen.generateModuleDoc(childModuleId);
    
    // 验证子模块文档生成成功
    const childDocPath = path.join(config.docsDir, 'modules', 'parent', 'child.md');
    const childDocExists = await fileExists(childDocPath);
    assert(childDocExists, '子模块文档未生成');
    
    // 测试8: 同步引擎
    console.log('测试8: 同步引擎');
    // 同步父模块（应该递归同步子模块）
    await syncEngine.syncModule(parentModuleId);
    
    // 验证同步成功
    const parentDocSynced = await fileExists(parentDocPath);
    assert(parentDocSynced, '父模块文档同步失败');
    
    const childDocSynced = await fileExists(childDocPath);
    assert(childDocSynced, '子模块文档同步失败');
    
    console.log('所有测试通过！');
  } catch (error) {
    console.error('测试失败:', error);
    process.exit(1);
  } finally {
    // 清理测试环境
    await cleanup();
  }
}

// 辅助函数：检查文件是否存在
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

// 运行测试
runTests();