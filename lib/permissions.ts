// 检查用户是否有权限编辑initiative
export function canEditInitiative(userAddress: string, creatorAddress: string): boolean {
  return userAddress.toLowerCase() === creatorAddress.toLowerCase();
}

// 检查用户是否有权限编辑item状态
export function canEditItemStatus(userAddress: string, creatorAddress: string): boolean {
  return userAddress.toLowerCase() === creatorAddress.toLowerCase();
}
