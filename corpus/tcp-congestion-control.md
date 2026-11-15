# TCP Congestion Control

Congestion control is the mechanism that keeps a TCP sender from overwhelming the network path between two hosts. The sender maintains a congestion window, usually called cwnd, which caps how much unacknowledged data may be in flight at once. The effective send limit is the smaller of the congestion window and the flow-control window advertised by the receiver.

A connection begins in slow start. The sender starts with a small initial window, commonly ten segments, and doubles the congestion window roughly every round trip time as acknowledgements arrive. Despite the name, slow start grows exponentially; it is slow only compared with blasting the full bandwidth at once. When the window reaches a threshold called ssthresh, the connection switches to congestion avoidance, where the window grows by about one segment per round trip, a linear probing for available capacity.

Packet loss is the classic congestion signal. On detecting loss through duplicate acknowledgements, the sender typically halves its congestion window and sets ssthresh to that reduced value, then resumes growing. A retransmission timeout is treated as a stronger signal and drops the window back to the initial value, restarting slow start.

Newer algorithms use different signals. CUBIC, the default on Linux for many years, grows the window as a cubic function of the time since the last loss event, which suits high-bandwidth, long-distance paths. BBR instead models the path's bottleneck bandwidth and round trip propagation delay from measurements, and paces packets to match that model rather than reacting mainly to loss. Because BBR does not need loss to slow down, it can keep queues short on paths where loss-based algorithms fill buffers and inflate latency, a problem known as bufferbloat.

Explicit Congestion Notification lets routers mark packets when queues build up, so endpoints can slow down before packets start dropping. Both endpoints and the routers on the path must support it for marking to happen.
