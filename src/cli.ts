import { Command } from 'commander';
import { createAppContext } from './app-context.js';
import { AppError } from './domain/errors.js';
import { printError, printInfo, printListings, printSuccess, printUser } from './cli-format.js';

const app = createAppContext();
const program = new Command();

function getCurrentUser() {
  const state = app.cliStateStore.read();
  const user = app.authService.getUserBySession(state.currentSessionId);
  if (!user) {
    throw new AppError('当前没有登录用户，请先登录');
  }
  return { state, user };
}

async function runSafely(action: () => Promise<void> | void): Promise<void> {
  try {
    await action();
  } catch (error) {
    if (error instanceof AppError) {
      printError(error.message);
      process.exitCode = 1;
      return;
    }

    const message = error instanceof Error ? error.message : '发生未知错误';
    printError(message);
    process.exitCode = 1;
  }
}

program.name('mcp-marketplace').description('MCP 市场第一版命令行演示');

program
  .command('register')
  .requiredOption('--email <email>', '用户邮箱')
  .requiredOption('--password <password>', '登录密码')
  .requiredOption('--name <displayName>', '显示名')
  .action(async (options) => runSafely(async () => {
    const user = await app.authService.register({
      email: options.email,
      password: options.password,
      displayName: options.name,
    });
    printSuccess('注册成功');
    printUser(user);
  }));

program
  .command('login')
  .requiredOption('--email <email>', '用户邮箱')
  .requiredOption('--password <password>', '登录密码')
  .action(async (options) => runSafely(async () => {
    const session = await app.authService.login({
      email: options.email,
      password: options.password,
    });
    app.cliStateStore.write({ currentSessionId: session.id });
    const user = app.authService.getUserBySession(session.id);
    printSuccess('登录成功');
    if (user) {
      printUser(user);
    }
  }));

program
  .command('logout')
  .action(() => runSafely(() => {
    const state = app.cliStateStore.read();
    if (!state.currentSessionId) {
      throw new AppError('当前没有登录会话');
    }

    app.authService.logout(state.currentSessionId);
    app.cliStateStore.clear();
    printSuccess('已退出登录');
  }));

program
  .command('me')
  .action(() => runSafely(() => {
    const { user } = getCurrentUser();
    printUser(user);
  }));

program
  .command('upload')
  .requiredOption('--title <title>', 'MCP 标题')
  .requiredOption('--summary <summary>', 'MCP 简介')
  .requiredOption('--version <version>', '版本号')
  .requiredOption('--transport <transport>', '传输方式')
  .requiredOption('--auth <authType>', '认证方式')
  .requiredOption('--source-type <sourceType>', '来源类型：endpoint 或 package')
  .option('--endpoint <endpointUrl>', 'Endpoint 地址')
  .option('--package-name <packageName>', '包名')
  .option('--package-registry <packageRegistry>', '包仓库')
  .option('--source-url <sourceUrl>', '源码地址')
  .option('--homepage-url <homepageUrl>', '主页地址')
  .option('--tags <tags>', '标签，逗号分隔')
  .option('--tasks <taskTypes>', '任务类型，逗号分隔')
  .action((options) => runSafely(() => {
    const { user } = getCurrentUser();
    const listing = app.mcpService.createListing(user.id, {
      title: options.title,
      summary: options.summary,
      version: options.version,
      transport: options.transport,
      authType: options.auth,
      sourceType: options.sourceType,
      endpointUrl: options.endpoint,
      packageName: options.packageName,
      packageRegistry: options.packageRegistry,
      sourceUrl: options.sourceUrl,
      homepageUrl: options.homepageUrl,
      tags: options.tags ? String(options.tags).split(',') : [],
      taskTypes: options.tasks ? String(options.tasks).split(',') : [],
    });

    printSuccess('MCP 上传成功');
    printListings([listing]);
  }));

program
  .command('delete')
  .requiredOption('--id <listingId>', 'MCP ID')
  .action((options) => runSafely(() => {
    const { user } = getCurrentUser();
    app.mcpService.deleteListing(user.id, options.id);
    printSuccess(`已删除 MCP：${options.id}`);
  }));

program
  .command('search')
  .option('--query <query>', '关键字查询')
  .option('--task <taskType>', '按任务类型筛选')
  .option('--transport <transport>', '按传输方式筛选')
  .action((options) => runSafely(() => {
    const listings = app.mcpService.searchPublic({
      query: options.query,
      taskType: options.task,
      transport: options.transport,
    });

    printListings(listings);
  }));

program
  .command('my-mcps')
  .action(() => runSafely(() => {
    const { user } = getCurrentUser();
    const listings = app.mcpService.listOwnedByUser(user.id);
    printInfo('以下是你当前拥有的 MCP');
    printListings(listings);
  }));

await program.parseAsync(process.argv);
