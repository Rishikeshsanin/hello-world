const std = @import("std");

pub fn main() !void {
    // Every great journey begins with a first line.
    try std.io.getStdOut().writer().print("Hello, World!\n", .{});
}
