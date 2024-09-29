"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usernameSchema } from "@/app/_lib/schema";
import { useEffect } from "react";
import useFetch from "@/hooks/useFetch";
import { updateUsername } from "@/actions/user";
import { BarLoader } from "react-spinners";
import { getLatestUpdates } from "@/actions/dashboard";
import { format } from 'date-fns';

const Dashboard = () => {
  const { isLoaded, user } = useUser();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(usernameSchema),
  });

  // Added user as a dependency
  useEffect(() => {
    if (isLoaded && user) {
      setValue("username", user.username);
    }
  }, [isLoaded, user, setValue]);

  const { loading, error, fn: fnUpdateUsername } = useFetch(updateUsername);

  const onSubmit = async (data) => {
    fnUpdateUsername(data.username);
  };

  const {
    loading: loadingUpdates,
    data: upcomingMeetings,
    fn: fnUpdates,
  } = useFetch(getLatestUpdates);

  // Added fnUpdates as a dependency
  useEffect(() => {
    (async () => await fnUpdates())();
  }, [fnUpdates]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user?.firstName}</CardTitle>
        </CardHeader>
        <CardContent>
          {!loadingUpdates ? (
            <div className="space-y-6 font-light">
              <div>
                {upcomingMeetings && upcomingMeetings.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {upcomingMeetings.map((meeting) => (
                      <li key={meeting.id}>
                        {meeting.event.title} on{" "}
                        {format(new Date(meeting.startTime), "MMM d, yyyy h:mm a")}{" "}
                        with {meeting.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No upcoming meetings</p>
                )}
              </div>
            </div>
          ) : (
            <p>Loading updates...</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Your Unique Link</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span>{window?.location.origin}/</span>
                <Input {...register("username")} placeholder="UserName" />
              </div>
              {errors.username && (
                <p className="text-red-500">
                  {typeof errors.username.message === "string"
                    ? errors.username.message
                    : "Invalid input"}
                </p>
              )}
              {error && (
                <p className="text-red-500 text-sm mt-1">{error.message}</p>
              )}
            </div>
            {loading && <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />}
            <Button type="submit">Update user name</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;