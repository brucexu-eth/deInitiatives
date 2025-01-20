import { prisma } from '@/lib/prisma';
import ReactMarkdown from 'react-markdown';

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
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{item.title}</ReactMarkdown>
              </div>
              {item.description && (
                <div className="mt-2 text-gray-600 prose prose-sm max-w-none">
                  <ReactMarkdown>{item.description}</ReactMarkdown>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-1 text-sm text-gray-500 whitespace-nowrap">
              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                item.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : item.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
