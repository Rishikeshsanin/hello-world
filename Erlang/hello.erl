-module(hello).
-export([main/0]).

main() ->
    % this is a comment and is ignored by the compiler
    % Every great journey begins with a first line.
    io:format("Hello, World!~n").
