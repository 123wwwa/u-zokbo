"use client";

import { useGetDiscussions } from "@/lib/queries/discussions";
import { Discussion } from "@/types/schema";
import DiscussionItem from "@/components/common/DiscussionItem";
import React from "react";

interface DiscussionsListProps {
	initialDiscussions: Discussion[];
	initialTotal: number;
	page?: number;
	count?: number;
	orderBy?: string;
}

function DiscussionsList({
	initialDiscussions,
	initialTotal,
	page,
	count,
	orderBy,
}: DiscussionsListProps) {
	const { data: discussions } = useGetDiscussions(
		{ page, count, orderBy, isQna: false },
		{
			initialData: { total: initialTotal, hits: initialDiscussions },
		}
	);
	return (
		<article className="flex flex-col gap-2">
			<div className="text-large font-bold">{discussions?.total} results</div>
			<div className="flex flex-col gap-4">
				{discussions?.hits.map((discussion) => (
					<DiscussionItem key={discussion.id} discussion={discussion} />
				))}
			</div>
		</article>
	);
}

export default DiscussionsList;
