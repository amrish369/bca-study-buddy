import { Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-4 w-4" />
            </span>
            <span className="font-extrabold">BCA Master Hub</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            The all-in-one AI-powered preparation platform for IGNOU BCA students.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Resources</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/papers" className="hover:text-foreground">Previous Year Papers</Link></li>
            <li><Link to="/courses" className="hover:text-foreground">Course Database</Link></li>
            <li><Link to="/analysis" className="hover:text-foreground">PYQ Analysis</Link></li>
            <li><Link to="/assignments" className="hover:text-foreground">Solved Assignments</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Tools</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/dashboard" className="hover:text-foreground">Exam Dashboard</Link></li>
            <li><Link to="/updates" className="hover:text-foreground">IGNOU Updates</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">About</h4>
          <p className="mt-3 text-sm text-muted-foreground">
            This is an independent student resource and is not affiliated with or endorsed by IGNOU.
          </p>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} IGNOU BCA Master Hub. Built for learners.
      </div>
    </footer>
  );
}
