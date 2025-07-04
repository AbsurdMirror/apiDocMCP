// src/examples/createSampleData.js - 创建示例数据
const { StorageManager } = require('../storage');
const { SyncEngine } = require('../sync');

async function createSampleData() {
  try {
    console.log('开始创建示例数据...');
    
    // 初始化存储和同步引擎
    const storage = new StorageManager();
    const syncEngine = new SyncEngine();
    
    // 创建用户模块
    console.log('创建用户模块...');
    const userModuleData = {
      moduleName: 'user',
      description: '用户管理模块，提供用户注册、登录、信息管理等功能'
    };
    const userModuleId = await storage.createModule(userModuleData);
    console.log(`用户模块创建成功，ID: ${userModuleId}`);
    
    // 创建用户API
    console.log('创建用户API...');
    const userApis = [
      {
        moduleId: userModuleId,
        apiName: 'register',
        functionDeclaration: 'async function register(username, password, email)',
        description: '用户注册API，接受用户名、密码和邮箱参数，返回注册结果和用户ID'
      },
      {
        moduleId: userModuleId,
        apiName: 'login',
        functionDeclaration: 'async function login(username, password)',
        description: '用户登录API，接受用户名和密码参数，验证成功后返回用户信息和访问令牌'
      },
      {
        moduleId: userModuleId,
        apiName: 'getUserInfo',
        functionDeclaration: 'async function getUserInfo(userId)',
        description: '获取用户信息API，接受用户ID参数，返回用户的详细信息'
      }
    ];
    
    for (const apiData of userApis) {
      const apiId = await storage.createApi(apiData);
      console.log(`API "${apiData.apiName}" 创建成功，ID: ${apiId}`);
    }
    
    // 创建产品模块
    console.log('创建产品模块...');
    const productModuleData = {
      moduleName: 'product',
      description: '产品管理模块，提供产品创建、查询、更新等功能'
    };
    const productModuleId = await storage.createModule(productModuleData);
    console.log(`产品模块创建成功，ID: ${productModuleId}`);
    
    // 创建产品API
    console.log('创建产品API...');
    const productApis = [
      {
        moduleId: productModuleId,
        apiName: 'createProduct',
        functionDeclaration: 'async function createProduct(name, description, price, category)',
        description: '创建产品API，接受产品名称、描述、价格和分类参数，返回创建结果和产品ID'
      },
      {
        moduleId: productModuleId,
        apiName: 'getProductList',
        functionDeclaration: 'async function getProductList(category, page, pageSize)',
        description: '获取产品列表API，支持按分类筛选和分页，返回产品列表和总数'
      },
      {
        moduleId: productModuleId,
        apiName: 'updateProduct',
        functionDeclaration: 'async function updateProduct(productId, updateData)',
        description: '更新产品API，接受产品ID和更新数据参数，返回更新结果'
      }
    ];
    
    for (const apiData of productApis) {
      const apiId = await storage.createApi(apiData);
      console.log(`API "${apiData.apiName}" 创建成功，ID: ${apiId}`);
    }
    
    // 同步所有文档
    console.log('同步文档...');
    await syncEngine.syncAll();
    console.log('文档同步完成');
    
    console.log('示例数据创建完成！');
  } catch (error) {
    console.error('创建示例数据失败:', error);
  }
}

// 执行创建示例数据
createSampleData();