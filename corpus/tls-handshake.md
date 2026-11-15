# The TLS Handshake

Transport Layer Security gives a connection confidentiality, integrity, and authentication of the server, and optionally of the client. Before any application data moves, the two endpoints run a handshake to agree on cryptographic parameters and derive shared session keys.

In TLS 1.3 the client opens with a ClientHello message. It lists the protocol versions and cipher suites it supports and includes a key share: an ephemeral Diffie-Hellman public value for the groups it expects the server to accept. Sending the key share immediately is what lets TLS 1.3 finish the handshake in a single round trip.

The server replies with a ServerHello that selects the parameters and carries its own key share. From the two key shares both sides compute the same shared secret, and from that secret they derive the encryption keys for the session. Everything after the ServerHello is encrypted. The server then sends its certificate chain and a CertificateVerify message, a signature over the handshake transcript that proves it holds the private key matching the certificate. The client validates the chain against its trust store, checking expiry, the hostname, and that the chain leads to a trusted certificate authority.

Because the Diffie-Hellman values are ephemeral and generated fresh per session, TLS 1.3 provides forward secrecy. Stealing the server's long-term private key later does not let an attacker decrypt recorded traffic, because the session keys depended on ephemeral values that are discarded.

TLS 1.3 also offers a zero round trip resumption mode for repeat connections, where the client sends application data with its first message using a pre-shared key from a previous session. That early data is not forward secret and can be replayed by an attacker, so servers should only accept it for idempotent requests.
