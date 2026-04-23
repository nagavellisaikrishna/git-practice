import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Copy,
  Check,
  Terminal,
  FolderTree,
  FileText,
  Network,
  GitBranch,
  Cpu,
  Archive,
  Shield,
  Zap,
} from "lucide-react";

type Snippet = {
  id: string;
  category: string;
  title: string;
  command: string;
  description: string;
  example?: string;
};

const CATEGORIES = [
  { id: "all", label: "All", icon: Terminal },
  { id: "files", label: "Files", icon: FileText },
  { id: "dirs", label: "Directories", icon: FolderTree },
  { id: "search", label: "Search", icon: Search },
  { id: "network", label: "Network", icon: Network },
  { id: "git", label: "Git", icon: GitBranch },
  { id: "process", label: "Processes", icon: Cpu },
  { id: "archive", label: "Archives", icon: Archive },
  { id: "perms", label: "Permissions", icon: Shield },
];

const SNIPPETS: Snippet[] = [
  {
    id: "ls",
    category: "dirs",
    title: "List directory contents",
    command: "ls -lah",
    description: "Long format, all files (including hidden), human-readable sizes.",
    example: "$ ls -lah\ndrwxr-xr-x  5 user  staff   160B Apr 23 10:12 .\ndrwxr-xr-x  3 user  staff    96B Apr 22 09:01 ..\n-rw-r--r--  1 user  staff   1.2K Apr 23 10:12 README.md",
  },
  {
    id: "cd",
    category: "dirs",
    title: "Change directory",
    command: "cd path/to/dir",
    description: "Use `cd -` to jump back to the previous directory, `cd ~` for home.",
  },
  {
    id: "mkdir",
    category: "dirs",
    title: "Create nested directories",
    command: "mkdir -p a/b/c",
    description: "The -p flag creates parent directories as needed and ignores existing ones.",
  },
  {
    id: "find",
    category: "search",
    title: "Find files by name",
    command: 'find . -type f -name "*.log"',
    description: "Recursively find regular files matching a glob from the current directory.",
    example: '$ find . -type f -name "*.log"\n./logs/app.log\n./var/error.log',
  },
  {
    id: "grep",
    category: "search",
    title: "Recursive text search",
    command: 'grep -rni "TODO" src/',
    description: "Recursive (-r), line numbers (-n), case-insensitive (-i) search.",
  },
  {
    id: "rg",
    category: "search",
    title: "Fast search with ripgrep",
    command: 'rg "pattern" --type ts',
    description: "ripgrep is faster than grep and respects .gitignore by default.",
  },
  {
    id: "cp",
    category: "files",
    title: "Copy files / directories",
    command: "cp -r src/ backup/",
    description: "Use -r for recursive, -v for verbose, -i to prompt before overwrite.",
  },
  {
    id: "mv",
    category: "files",
    title: "Move or rename",
    command: "mv old.txt new.txt",
    description: "Same command for renaming and relocating files.",
  },
  {
    id: "rm",
    category: "files",
    title: "Remove safely",
    command: "rm -rf folder/",
    description: "Recursive force delete. Double-check the path — there is no trash.",
  },
  {
    id: "tar",
    category: "archive",
    title: "Create a tar.gz archive",
    command: "tar -czvf out.tar.gz folder/",
    description: "c=create, z=gzip, v=verbose, f=file. Swap c→x to extract.",
  },
  {
    id: "untar",
    category: "archive",
    title: "Extract a tar.gz",
    command: "tar -xzvf in.tar.gz",
    description: "Use -C target/ to extract into a specific directory.",
  },
  {
    id: "zip",
    category: "archive",
    title: "Zip a folder",
    command: "zip -r out.zip folder/",
    description: "Recursive zip. Use `unzip out.zip` to extract.",
  },
  {
    id: "curl",
    category: "network",
    title: "HTTP request with curl",
    command: 'curl -sS -X POST -H "Content-Type: application/json" \\\n  -d \'{"name":"ada"}\' https://api.example.com/users',
    description: "-s silent, -S show errors, -X method, -H header, -d body.",
  },
  {
    id: "wget",
    category: "network",
    title: "Download a file",
    command: "wget -c https://example.com/file.iso",
    description: "-c resumes interrupted downloads.",
  },
  {
    id: "ssh",
    category: "network",
    title: "SSH into a server",
    command: "ssh -i ~/.ssh/key.pem user@host",
    description: "Add `-p 2222` for a custom port. Configure shortcuts in ~/.ssh/config.",
  },
  {
    id: "scp",
    category: "network",
    title: "Copy over SSH",
    command: "scp file.txt user@host:/remote/path/",
    description: "Add -r to copy directories. Use rsync for large or repeated transfers.",
  },
  {
    id: "git-status",
    category: "git",
    title: "Working tree status",
    command: "git status -sb",
    description: "Short, branch-aware status. Easier to scan than the default.",
  },
  {
    id: "git-log",
    category: "git",
    title: "Pretty git log",
    command: 'git log --oneline --graph --decorate -20',
    description: "A compact, graph-shaped view of the last 20 commits.",
  },
  {
    id: "git-undo",
    category: "git",
    title: "Undo last commit (keep changes)",
    command: "git reset --soft HEAD~1",
    description: "Moves HEAD back one commit but keeps your changes staged.",
  },
  {
    id: "git-stash",
    category: "git",
    title: "Stash work in progress",
    command: "git stash push -m \"wip: refactor\"",
    description: "Save dirty changes. Restore with `git stash pop`.",
  },
  {
    id: "ps",
    category: "process",
    title: "List processes",
    command: "ps aux | grep node",
    description: "All processes, BSD format, filtered for `node`.",
  },
  {
    id: "kill",
    category: "process",
    title: "Kill a process",
    command: "kill -9 <pid>",
    description: "Send SIGKILL. Try `kill <pid>` (SIGTERM) first for graceful shutdown.",
  },
  {
    id: "lsof",
    category: "process",
    title: "What's using this port?",
    command: "lsof -iTCP:5173 -sTCP:LISTEN",
    description: "Find the process holding a TCP port (handy for dev server clashes).",
  },
  {
    id: "df",
    category: "process",
    title: "Disk space",
    command: "df -h",
    description: "Human-readable disk usage per mounted filesystem.",
  },
  {
    id: "du",
    category: "process",
    title: "Folder size",
    command: "du -sh *",
    description: "Summarised, human-readable sizes for everything in the cwd.",
  },
  {
    id: "chmod",
    category: "perms",
    title: "Make a script executable",
    command: "chmod +x script.sh",
    description: "Adds execute bit. For numeric: 755 = rwxr-xr-x.",
  },
  {
    id: "chown",
    category: "perms",
    title: "Change ownership",
    command: "sudo chown -R user:group folder/",
    description: "Recursively change owner and group of a directory tree.",
  },
  {
    id: "sed",
    category: "files",
    title: "Find and replace in place",
    command: "sed -i 's/foo/bar/g' file.txt",
    description: "On macOS use `sed -i ''` (empty backup suffix is required).",
  },
  {
    id: "awk",
    category: "files",
    title: "Print a column",
    command: "awk '{print $2}' file.txt",
    description: "Whitespace-delimited columns. Use -F',' for CSVs.",
  },
  {
    id: "xargs",
    category: "files",
    title: "Pipe args into a command",
    command: 'find . -name "*.tmp" | xargs rm',
    description: "Use `xargs -I{} cmd {}` for templated invocations.",
  },
  {
    id: "history",
    category: "all",
    title: "Search shell history",
    command: "history | grep ssh",
    description: "Press Ctrl+R for interactive reverse-search in most shells.",
  },
];

function CategoryIcon({ id, className }: { id: string; className?: string }) {
  const cat = CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
  const Icon = cat.icon;
  return <Icon className={className} />;
}

export function BashHelper() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string>("find");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SNIPPETS.filter((s) => {
      if (activeCategory !== "all" && s.category !== activeCategory) return false;
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        s.command.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    });
  }, [query, activeCategory]);

  const selected = SNIPPETS.find((s) => s.id === selectedId) ?? filtered[0];

  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1400);
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/30 flex items-center justify-center">
              <Terminal className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Bash Helper</h1>
              <p className="text-xs text-zinc-400">
                A searchable cheatsheet for everyday shell commands
              </p>
            </div>
          </div>
          <Badge variant="outline" className="border-zinc-700 text-zinc-300">
            <Zap className="h-3 w-3 mr-1 text-emerald-400" />
            {SNIPPETS.length} snippets
          </Badge>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands… (e.g. 'find', 'port', 'git log')"
            className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 h-11"
          />
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const active = activeCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors " +
                  (active
                    ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40"
                    : "bg-zinc-900 text-zinc-300 ring-1 ring-zinc-800 hover:bg-zinc-800")
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* List */}
          <Card className="md:col-span-2 bg-zinc-900 border-zinc-800">
            <CardContent className="p-0">
              <ScrollArea className="h-[520px]">
                <ul className="divide-y divide-zinc-800">
                  {filtered.length === 0 && (
                    <li className="p-6 text-sm text-zinc-500">
                      No snippets match "{query}".
                    </li>
                  )}
                  {filtered.map((s) => {
                    const active = s.id === selected?.id;
                    return (
                      <li key={s.id}>
                        <button
                          onClick={() => setSelectedId(s.id)}
                          className={
                            "w-full text-left px-4 py-3 flex items-start gap-3 transition-colors " +
                            (active
                              ? "bg-zinc-800/70"
                              : "hover:bg-zinc-800/40")
                          }
                        >
                          <div className="mt-0.5 h-7 w-7 shrink-0 rounded-md bg-zinc-800 flex items-center justify-center">
                            <CategoryIcon
                              id={s.category}
                              className="h-3.5 w-3.5 text-zinc-300"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-medium text-zinc-100 truncate">
                                {s.title}
                              </p>
                            </div>
                            <p className="mt-0.5 truncate text-xs font-mono text-emerald-300/90">
                              {s.command.split("\n")[0]}
                            </p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Detail */}
          <Card className="md:col-span-3 bg-zinc-900 border-zinc-800">
            <CardContent className="p-5">
              {selected ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <CategoryIcon
                          id={selected.category}
                          className="h-3.5 w-3.5"
                        />
                        <span className="capitalize">
                          {CATEGORIES.find((c) => c.id === selected.category)
                            ?.label ?? selected.category}
                        </span>
                      </div>
                      <h2 className="mt-1 text-lg font-semibold">
                        {selected.title}
                      </h2>
                    </div>
                    <Button
                      onClick={() => copy(selected.command, selected.id)}
                      size="sm"
                      className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
                    >
                      {copiedId === selected.id ? (
                        <>
                          <Check className="h-4 w-4 mr-1.5" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1.5" /> Copy
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="relative rounded-lg bg-black/60 ring-1 ring-zinc-800 overflow-hidden">
                    <div className="flex items-center gap-1.5 px-3 py-2 border-b border-zinc-800 bg-zinc-900/60">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                      <span className="ml-2 text-[11px] uppercase tracking-wider text-zinc-500">
                        bash
                      </span>
                    </div>
                    <pre className="p-4 text-sm font-mono leading-relaxed text-emerald-300 overflow-x-auto whitespace-pre">
{`$ ${selected.command}`}
                    </pre>
                  </div>

                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {selected.description}
                  </p>

                  {selected.example && (
                    <>
                      <Separator className="bg-zinc-800" />
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-2">
                          Example output
                        </p>
                        <pre className="rounded-md bg-black/40 ring-1 ring-zinc-800 p-3 text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre">
{selected.example}
                        </pre>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">
                  Select a command from the list.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-500">
          Tip: pipe with <span className="font-mono text-zinc-300">|</span>,
          chain with <span className="font-mono text-zinc-300">&amp;&amp;</span>,
          and background with <span className="font-mono text-zinc-300">&amp;</span>.
        </p>
      </div>
    </div>
  );
}
