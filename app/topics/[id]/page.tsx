import { Metadata } from 'next';
import { TopicHeader } from '@/components/topic-header';
import { ItemList } from '@/components/item-list';
import { prisma } from '@/lib/prisma';

interface Props {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const topic = await prisma.topic.findUnique({
    where: { id: params.id },
  });

  if (!topic) {
    return {
      title: 'Topic Not Found',
    };
  }

  return {
    title: topic.title,
    description: topic.description,
  };
}

export default async function TopicPage({ params }: Props) {
  const topic = await prisma.topic.findUnique({
    where: { id: params.id },
  });

  if (!topic) {
    return (
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold">Topic not found</h1>
          <p className="mt-2 text-gray-500">
            The topic you are looking for does not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4">
      <TopicHeader topic={topic} />
      <ItemList topicId={topic.id} />
    </div>
  );
}
