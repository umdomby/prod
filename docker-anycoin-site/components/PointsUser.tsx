import React from "react";
import {User} from "@prisma/client";

interface PointsUserProps {
    user: User;
}
export const PointsUser: React.FC<PointsUserProps> = ({ user }) => (
    <div className="absolute top-0 flex justify-center items-center ml-20 py-2 z-50 transform -translate-y-12 mx-auto max-w-xs">
        <p className="text-sm font-bold">
            Points: <span className="text-red-500 textDecoration: 'none'">{Math.floor((user.points ?? 0) * 100) / 100}</span>
        </p>
    </div>
);