"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { FamilyActivity } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Users, Plus, Edit, Trash2, Bell } from "lucide-react";
import { clsx } from "clsx";

interface FamilyActivityFeedProps {
  familyId: Id<"families">;
  limit?: number;
  showHeader?: boolean;
  className?: string;
}

function ActivityItem({ activity }: { activity: FamilyActivity }) {
  const timeAgo = formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true });

  const getActionIcon = () => {
    switch (activity.action) {
      case "transaction_added":
        return <Plus className="w-4 h-4 text-green-500" />;
      case "transaction_updated":
        return <Edit className="w-4 h-4 text-blue-500" />;
      case "transaction_deleted":
        return <Trash2 className="w-4 h-4 text-red-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionColor = () => {
    switch (activity.action) {
      case "transaction_added":
        return "border-l-green-500 bg-green-50";
      case "transaction_updated":
        return "border-l-blue-500 bg-blue-50";
      case "transaction_deleted":
        return "border-l-red-500 bg-red-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  const getAmountDisplay = () => {
    if (activity.metadata?.amount) {
      const amount = activity.metadata.amount as number;
      const category = activity.metadata?.category as string;
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-white rounded-full border">
          ${amount.toFixed(2)} • {category}
        </span>
      );
    }
    return null;
  };

  return (
    <div className={clsx(
      "flex items-start space-x-3 p-4 rounded-lg border-l-4 transition-all duration-200 hover:shadow-sm",
      getActionColor()
    )}>
      {/* User Avatar */}
      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
        {activity.userName.charAt(0).toUpperCase()}
      </div>
      
      {/* Activity Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          {getActionIcon()}
          <span className="text-sm text-gray-600 truncate">
            {activity.description}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {timeAgo}
          </div>
          {getAmountDisplay()}
        </div>
      </div>
    </div>
  );
}

export default function FamilyActivityFeed({ 
  familyId, 
  limit = 10, 
  showHeader = true,
  className 
}: FamilyActivityFeedProps) {
  // For now, we'll simulate the activity feed since we need to create the proper Convex query
  // TODO: Create convex/activity.ts query for getFamilyActivity
  // TODO: Replace with actual Convex query when activity.ts is implemented
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activities = useQuery(api.activity?.getFamilyActivity as any, {
    familyId,
    limit,
  }) as FamilyActivity[] | undefined;

  if (activities === undefined) {
    return (
      <div className={clsx("space-y-3", className)}>
        {showHeader && (
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Family Activity</h2>
          </div>
        )}
        
        {/* Loading skeleton */}
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex items-start space-x-3 p-4 rounded-lg border-l-4 border-l-gray-200 bg-gray-50 animate-pulse">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Mock data for demonstration since we need to implement the activity API
  const mockActivities: FamilyActivity[] = [
    {
      _id: "mock1" as Id<"familyActivity">,
      familyId,
      userId: "user1",
      userName: "Sarah",
      action: "transaction_added",
      targetId: "trans1" as Id<"transactions">,
      description: "Sarah spent $15.50 on lunch",
      metadata: { amount: 15.50, category: "variable" },
      createdAt: Date.now() - 5 * 60 * 1000, // 5 minutes ago
      notificationSent: false,
    },
    {
      _id: "mock2" as Id<"familyActivity">,
      familyId,
      userId: "user2", 
      userName: "Mike",
      action: "transaction_added",
      targetId: "trans2" as Id<"transactions">,
      description: "Mike spent $45.00 on groceries",
      metadata: { amount: 45.00, category: "variable" },
      createdAt: Date.now() - 20 * 60 * 1000, // 20 minutes ago
      notificationSent: false,
    },
    {
      _id: "mock3" as Id<"familyActivity">,
      familyId,
      userId: "user1",
      userName: "Sarah", 
      action: "transaction_updated",
      targetId: "trans3" as Id<"transactions">,
      description: "Sarah updated coffee shop expense",
      metadata: { amount: 8.50, category: "variable" },
      createdAt: Date.now() - 60 * 60 * 1000, // 1 hour ago
      notificationSent: false,
    }
  ];

  const displayActivities: FamilyActivity[] = activities || mockActivities;

  if (!displayActivities || displayActivities.length === 0) {
    return (
      <div className={clsx("text-center py-8", className)}>
        {showHeader && (
          <div className="flex items-center space-x-2 mb-6 justify-center">
            <Users className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Family Activity</h2>
          </div>
        )}
        
        <div className="text-gray-400 mb-4">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
        </div>
        <h3 className="text-lg font-medium text-gray-500 mb-2">No recent activity</h3>
        <p className="text-gray-400 text-sm">Family member activity will appear here as expenses are added.</p>
      </div>
    );
  }

  return (
    <div className={clsx("space-y-3", className)}>
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Family Activity</h2>
          </div>
          
          {/* Live indicator */}
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {displayActivities.slice(0, limit).map((activity) => (
          <ActivityItem key={activity._id} activity={activity} />
        ))}
      </div>
      
      {/* View All Link */}
      {displayActivities.length > limit && (
        <div className="text-center pt-4">
          <button className="text-blue-500 hover:text-blue-600 font-medium text-sm">
            View all activity
          </button>
        </div>
      )}
    </div>
  );
}