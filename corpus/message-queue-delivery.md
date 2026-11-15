# Message Queue Delivery Semantics

Message queues decouple producers from consumers by storing messages until a consumer is ready to process them. The guarantee a queue offers about delivery shapes how consumers must be written, and the industry names three levels of guarantee.

At-most-once delivery means a message may be lost but is never delivered twice. The queue removes the message as soon as it is sent, or the consumer acknowledges before processing. If the consumer crashes mid-processing, the message is gone. This level is cheap and fast, and it suits data where an occasional loss is acceptable, such as individual metrics points.

At-least-once delivery means a message is never lost but may be delivered more than once. The queue keeps the message until the consumer acknowledges it after processing. If the acknowledgement is lost, or the consumer takes too long and a visibility timeout expires, the queue delivers the message again. Consumers under this guarantee must be idempotent: processing the same message twice must have the same effect as processing it once, for example by recording processed message ids or by making the write itself naturally repeatable. This is the most common guarantee in production systems.

Exactly-once delivery, in the strict end-to-end sense, is generally considered impossible over unreliable networks, because a crash can always strike between processing a message and acknowledging it. Systems that advertise exactly-once usually mean effectively-once processing inside their own boundaries, achieved by combining at-least-once delivery with deduplication or transactional writes, as in Kafka's idempotent producer and transactions feature.

Ordering is a separate concern from delivery. Most queues deliver messages in order only within a limited scope, such as a single partition or a message group, because strict global ordering forces all messages through one path and destroys parallel throughput. Consumers that need ordering usually partition by a key, such as a customer id, so everything for one key stays in sequence while different keys proceed in parallel.
