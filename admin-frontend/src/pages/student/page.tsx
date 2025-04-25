import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2, Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEffect, useState } from "react";
import { deleteStudent, getStudent } from "@/services/api";
import StudentLoading from "@/components/loading/StudentLoading";

interface Student {
  _id: string;
  name: string;
  registrationNumber: string;
  courseName: string;
  startDate: string;
  endDate: string;
  certificateUrl: string;
  marksheetUrl: string;
  studentPicUrl: string;
}

export default function StudentPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const navigate = useNavigate();

  const params = useParams();

  const handleDelete = async (registrationNumber: string) => {
    setDeleting(true);
    try {
      await deleteStudent(registrationNumber);
      navigate("/");
    } catch (error: any) {
      setDeleteError(
        error.response?.data?.message || "Please refresh the page"
      );
    } finally {
      setDeleting(false);
    }
  };

  const fetchStudent = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getStudent(params.registrationNumber as string);
      setStudent(response.data.data);
    } catch (err: any) {
      console.log("Error fetching student:", err);
      setError(
        err.response?.data?.message ||
          "An error occurred please check your network connection and try again"
      );
      setStudent(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [params.registrationNumber]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return <StudentLoading />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <CardTitle className="mt-4">Unable to Load Student</CardTitle>
            <CardDescription>
              We encountered a problem while trying to fetch student
              information.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button onClick={fetchStudent}>Try Again</Button>
            <Link to="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Student Not Found</CardTitle>
            <CardDescription>
              The student with registration number {params.registrationNumber}{" "}
              could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-14 items-center border-b bg-background px-6">
        <h1 className="text-lg font-medium text-foreground">
          Student Information
        </h1>
      </header>
      <main className="flex flex-1 flex-col gap-6 md:p-6 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h2 className="text-xl font-semibold text-foreground">
              {student.name}
            </h2>
          </div>

          <Dialog onOpenChange={() => setDeleteError(null)}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                Delete
              </Button>
            </DialogTrigger>

            <DialogContent className="space-y-4">
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete the
                  student record.
                </DialogDescription>
              </DialogHeader>

              {deleteError && (
                <Alert variant="destructive">
                  <AlertTitle className="text-sm font-medium">
                    {deleteError}
                  </AlertTitle>
                </Alert>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  onClick={() => handleDelete(student.registrationNumber)}
                  variant="destructive"
                  className="min-w-25"
                  disabled={deleting}
                >
                  {deleting ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    "Delete"
                  )}
                </Button>
                <DialogTrigger asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogTrigger>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-2 flex items-center">
            <div className="flex flex-col sm:flex-row w-full items-center sm:items-start gap-4">
              <div className="rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-100">
                <img
                  src={student.studentPicUrl}
                  alt={`${student.name}'s profile`}
                  className="h-24 w-24 object-cover"
                />
              </div>
              <div className="flex flex-col w-full">
                <CardDescription className="text-muted-foreground text-center sm:text-left">
                  Registration: {student.registrationNumber}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-y-4 gap-x-8 sm:grid-cols-2">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Name
                </div>
                <div className="mt-1 text-foreground">{student.name}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Course
                </div>
                <div className="mt-1 text-foreground">{student.courseName}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Start Date
                </div>
                <div className="mt-1 text-foreground">
                  {formatDate(student.startDate)}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  End Date
                </div>
                <div className="mt-1 text-foreground">
                  {formatDate(student.endDate)}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href={student.marksheetUrl} download>
                <Button variant="outline" size="sm" className="h-9">
                  <Download className="mr-2 h-4 w-4" />
                  Download Marksheet
                </Button>
              </a>
              <a href={student.certificateUrl} download>
                <Button variant="outline" size="sm" className="h-9">
                  <Download className="mr-2 h-4 w-4" />
                  Download Certificate
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
