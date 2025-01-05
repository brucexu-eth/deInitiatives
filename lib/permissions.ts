// 管理员地址列表
const ADMIN_ADDRESSES = [
  // 添加管理员的钱包地址
  '0x123...', // 替换为实际的管理员地址
];

export function isAdmin(address: string): boolean {
  return ADMIN_ADDRESSES.includes(address.toLowerCase());
}

export function canEditInitiative(userAddress: string, creatorAddress: string): boolean {
  return userAddress.toLowerCase() === creatorAddress.toLowerCase() || isAdmin(userAddress);
}

export function canEditItemStatus(userAddress: string): boolean {
  return isAdmin(userAddress);
}
