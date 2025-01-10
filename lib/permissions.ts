// 检查用户是否有权限编辑topic
export function canEditTopic(userAddress: string, creatorAddress: string): boolean {
  return (
    userAddress.toLowerCase() === creatorAddress.toLowerCase()
  );
}

// 检查用户是否有权限编辑item状态
export function canEditItemStatus(
  userAddress: string,
  topicCreator: string,
  itemCreator: string
): boolean {
  return (
    userAddress.toLowerCase() === topicCreator.toLowerCase() || // topic创建者
    userAddress.toLowerCase() === itemCreator.toLowerCase() // item创建者
  );
}
