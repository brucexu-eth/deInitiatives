import { prisma } from '@/lib/prisma';

interface ItemListProps {
  topicId: string;
}

export async function ItemList({ topicId }: ItemListProps) {
  const items = await prisma.item.findMany({
    where: { topicId },
    orderBy: { createdAt: 'desc' },
  });

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No items yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-6">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white shadow rounded-lg p-6"
        >
          <h3 className="text-lg font-medium">{item.title}</h3>
          {item.description && (
            <p className="mt-2 text-gray-600">{item.description}</p>
          )}
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
            <span className="mx-2">•</span>
            <span>Status: {item.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
