import chalk from 'chalk';
import { McpListing, SafeUser } from './domain/models.js';

export function printSuccess(message: string): void {
  console.log(chalk.green(`✔ ${message}`));
}

export function printError(message: string): void {
  console.error(chalk.red(`✖ ${message}`));
}

export function printInfo(message: string): void {
  console.log(chalk.cyan(`ℹ ${message}`));
}

export function printUser(user: SafeUser): void {
  console.log(chalk.bold('当前用户'));
  console.log(`- ID: ${user.id}`);
  console.log(`- 邮箱: ${user.email}`);
  console.log(`- 显示名: ${user.displayName}`);
}

export function printListings(listings: McpListing[]): void {
  if (listings.length === 0) {
    printInfo('当前没有符合条件的 MCP 记录');
    return;
  }

  for (const listing of listings) {
    console.log(chalk.bold(`
${listing.title} (${listing.id})`));
    console.log(`  简介: ${listing.summary}`);
    console.log(`  版本: ${listing.version}`);
    console.log(`  传输: ${listing.transport}`);
    console.log(`  认证: ${listing.authType}`);
    console.log(`  来源: ${listing.sourceType === 'endpoint' ? listing.endpointUrl : `${listing.packageRegistry}:${listing.packageName}`}`);
    console.log(`  标签: ${listing.tags.join(', ') || '无'}`);
    console.log(`  任务: ${listing.taskTypes.join(', ') || '无'}`);
    console.log(`  创建时间: ${listing.createdAt}`);
  }
}
