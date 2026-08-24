const std = @import("std");

pub fn main() !void {
    // this is a comment and is ignored by the compiler
    // Every great journey begins with a first line.
    try std.io.getStdOut().writer().print("Hello, World!\n", .{});
}
