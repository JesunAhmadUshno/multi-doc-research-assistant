# Raft Consensus

Raft is a consensus algorithm that lets a cluster of servers agree on one replicated log of commands, so the cluster behaves like a single reliable machine even when some servers fail. Each server is in one of three states at any moment: leader, follower, or candidate. Time is divided into terms, numbered with increasing integers, and each term begins with an election.

Followers wait for messages from a leader. If a follower hears nothing for a randomized election timeout, it assumes the leader has failed, increments the term, becomes a candidate, votes for itself, and asks the other servers for votes. A server votes for at most one candidate per term, and only if that candidate's log is at least as up to date as its own. A candidate that wins a majority of votes becomes the leader for the new term. Randomized timeouts make it unlikely that two followers time out simultaneously and split the vote repeatedly.

All client commands go to the leader, which appends them to its log and replicates them to followers with AppendEntries messages. An entry is committed once the leader has stored it on a majority of servers. The leader then applies it to its state machine and tells followers it is committed, so they apply it too. Because any majority overlaps with every other majority, a committed entry can never be lost: any future leader must hold it, which the voting restriction guarantees.

Raft tolerates failures of a minority of servers. A five-server cluster keeps working with two servers down, because three still form a majority. If a partition splits the cluster so no side has a majority, neither side can commit new entries, and the system chooses safety over availability until the partition heals.

Leaders also send periodic heartbeats, which are AppendEntries messages with no entries, to reset follower election timers and maintain their authority for the term.
